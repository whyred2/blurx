const db = require('../db');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

function getImageKey(imageUrl) {
  const parts = imageUrl.split('/');
  return parts[parts.length - 1];
}

const uploadCover = async (req, res) => {
  try {
    const file = req.file;
    const uploadParams = {
      Bucket: 'imagesbucketfordiplom/images/covers',
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: 'image/jpeg'
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    res.status(200).json({ success: true, coverImageUrl: uploadResult.Location });
  } catch (error) {
    console.error('Ошибка при загрузке обложки в S3:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const removeCover = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    const imageKey = getImageKey(imageUrl);
    console.log('Удаляем обложку с ключом:', imageKey);
    
    const params = {
      Bucket: 'imagesbucketfordiplom/images/covers',
      Key: imageKey
    };
    console.log('Параметры удаления:', params);
    await s3.deleteObject(params).promise();

    console.log('Обложка успешно удалена');
    res.status(200).json({ message: 'Обложка успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении обложки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const uploadFrames = async (req, res) => {
  try {
    const uploadedFrameUrls = [];

    for (const file of req.files) {
      const uploadParams = {
        Bucket: 'imagesbucketfordiplom/images/frames',
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: 'image/jpeg'
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      uploadedFrameUrls.push(uploadResult.Location);
    }

    res.status(200).json({ success: true, paths: uploadedFrameUrls });
  } catch (error) {
    console.error('Ошибка при загрузке кадров в S3:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const removeFrames = async (req, res) => {
  try {
    const { frameUrls } = req.body;

    await Promise.all(frameUrls.map(async (frameUrl) => {
      const frameKey = getImageKey(frameUrl);
      const params = {
        Bucket: 'imagesbucketfordiplom/images/frames',
        Key: frameKey
      };
      await s3.deleteObject(params).promise();
    }));

    console.log('Кадры успешно удалены');
    res.status(200).json({ message: 'Кадры успешно удалены' });
  } catch (error) {
    console.error('Ошибка при удалении кадров:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const getMoviesAndSeries = async (req, res) => {
  try {    
    const movies = await db('movies').select('*').limit(100);
    const series = await db('series').select('*').limit(100);

    res.json({ movies, series });
  } catch (error) {
    console.error('Ошибка при загрузке фильмов и сериалов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const contentFilter = async (req, res) => {
  const filters = req.body;
  try {    
    const hasGenres = Array.isArray(filters.genres) && filters.genres.length > 0;
    const hasAgeRating = Array.isArray(filters.age) && filters.age.length > 0;
    const hasYears = filters.years && filters.years.min && filters.years.max;

    let moviesQuery = `
      SELECT DISTINCT "movies".*
      FROM "movies"
      INNER JOIN "moviegenres" ON "movies"."id" = "moviegenres"."movie_id"
      WHERE 1=1
    `;

    let seriesQuery = `
      SELECT DISTINCT "series".*
      FROM "series"
      INNER JOIN "seriesgenres" ON "series"."id" = "seriesgenres"."series_id"
      WHERE 1=1
    `;

    if (hasGenres) {
      moviesQuery += `
        AND "moviegenres"."genre_id" IN (${filters.genres.join(',')})
      `;
      
      seriesQuery += `
        AND "seriesgenres"."genre_id" IN (${filters.genres.join(',')})
      `;
    }

    if (hasAgeRating) {
      moviesQuery += `
        AND "movies"."age_rating" IN (${filters.age.map(age => `'${age}'`).join(',')})
      `;
      
      seriesQuery += `
        AND "series"."age_rating" IN (${filters.age.map(age => `'${age}'`).join(',')})
      `;
    }

    if (hasYears) {
      moviesQuery += `
        AND "movies"."release_date" BETWEEN '${filters.years.min}-01-01' AND '${filters.years.max}-12-31'
      `;
      
      seriesQuery += `
        AND "series"."release_date" BETWEEN '${filters.years.min}-01-01' AND '${filters.years.max}-12-31'
      `;
    }

    const movies = await db.raw(moviesQuery);
    const series = await db.raw(seriesQuery);

    res.status(200).json({ movies: movies.rows, series: series.rows });
  } catch (error) {
    console.error('Ошибка фильтрации контента:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const contentSearch = async (req, res) => {
  const { q: query } = req.query;

  console.log('RESULT:', query);

  try {
    let moviesResult = [];
    let seriesResult = [];

    // Поиск фильмов
    const moviesQuery = `SELECT * FROM movies WHERE LOWER(title) LIKE LOWER('%${query}%')`;
    const moviesResponse = await db.raw(moviesQuery);
    moviesResult = moviesResponse.rows;

    // Поиск сериалов
    const seriesQuery = `SELECT * FROM series WHERE LOWER(title) LIKE LOWER('%${query}%')`;
    const seriesResponse = await db.raw(seriesQuery);
    seriesResult = seriesResponse.rows;

    const movies = await db.raw(moviesQuery);
    const series = await db.raw(seriesQuery);

    console.log('MOVIES:', movies.rows);
    console.log('SERIES:', series.rows);
    res.json({ movies: movies.rows, series: series.rows });
  } catch (error) {
    console.error('Ошибка при поиске:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


module.exports = {
  uploadCover,
  uploadFrames,
  removeCover,
  removeFrames,

  getMoviesAndSeries,
  
  contentFilter,
  contentSearch,
};
