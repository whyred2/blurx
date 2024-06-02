import React, { useEffect, useState } from 'react';
import { useTable, useSortBy, usePagination, useFilters, useResizeColumns, useFlexLayout } from 'react-table';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, ArrowLeftToLine, ArrowRightToLine, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';

// Функция для создания текстового фильтра
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
}) {
    return (
        <input
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined);
            }}
            placeholder={`Пошук...`}
            className="filter-input"
            onClick={e => e.stopPropagation()}
        />
    );
}

// Функция для фильтрации диапазона чисел
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter },
}) {
  return (
    <div className="range-inputs">
      <input
        value={filterValue[0] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]]);
        }}
        placeholder={`Мін`}
        className="filter-input range-input"
        onClick={e => e.stopPropagation()}
      />
      <input
        value={filterValue[1] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined]);
        }}
        placeholder={`Макс`}
        className="filter-input range-input"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// Функция для создания фильтра возраста
function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
}) {
    const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
        options.add(row.values[id]);
    });
    return [...options.values()];
    }, [id, preFilteredRows]);

    return (
        <select
            value={filterValue}
            onChange={e => {
            setFilter(e.target.value || undefined);
            }}
            className="filter-input"
            onClick={e => e.stopPropagation()}
        >
            <option value="">Усі</option>
            {options.map((option, i) => (
            <option key={i} value={option}>
                {option}
            </option>
            ))}
        </select>
    );
}

// Компонент для редактирования ячейки
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData,
}) => {
  const [value, setValue] = useState(initialValue);

  const onChange = e => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateMyData(index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input className='row-input' value={value} onChange={onChange} onBlur={onBlur} />;
};

const AdminTable = ({ columns, data, defaultPageSize = 10 }) => {
  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
      Cell: EditableCell,
    }),
    []
  );

  const updateMyData = (rowIndex, columnId, value) => {
    const row = data[rowIndex];
    const contentType = row.contentType;
    data[rowIndex][columnId] = value;

    axios.put('http://localhost:3001/admin/content/update', {
      contentType,
      rowIndex: row.id,
      columnId,
      value,
    })
      .then(response => {
        console.log('Данные успешно обновлены:', response.data);
      })
      .catch(error => {
        console.error('Ошибка при обновлении данных:', error);
      });

  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex, pageSize },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: 0, pageSize: defaultPageSize },
      updateMyData,
    },
    useFilters,
    useSortBy,
    usePagination,
    useResizeColumns,
    useFlexLayout
  );

  return (
    <>
      <div className='table-container'>
        <table className='admin-table' {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    <div {...(column.getSortByToggleProps ? column.getSortByToggleProps() : {})} className="header-content">
                      <span className='header-table-title'>
                        {column.render('Header')}
                        {column.isSorted ? (column.isSortedDesc ? 
                        <ArrowDownWideNarrow className='table-icon' size={16} /> : 
                        <ArrowUpNarrowWide className='table-icon' size={16} />) : ''}
                      </span>
                      
                    </div>
                    {column.canResize && (
                        <div
                          {...column.getResizerProps()}
                          className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                        />
                      )}
                    <div style={{overflow: 'hidden'}}>{column.canFilter ? column.render('Filter') : null}</div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className='admin-table-pagination'>
        <div className='admin-table-pagination-btns'>
          <button className='pagination-btn' onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            <ArrowLeftToLine size={22} min={22} />
          </button>
          <button className='pagination-btn' onClick={() => previousPage()} disabled={!canPreviousPage}>
            <ArrowLeft size={22} min={22} />
          </button>
          <span>
            Сторінка{' '}
            <strong>
              {pageIndex + 1} із {pageOptions.length}
            </strong>
          </span>
          <button className='pagination-btn' onClick={() => nextPage()} disabled={!canNextPage}>
            <ArrowRight size={22} min={22} />
          </button>
          <button className='pagination-btn' onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
            <ArrowRightToLine size={22} min={22} />
          </button>
          <div className='table-line'></div>
          <span className="table-input-container">
            Перейти на сторінку:
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              className='change-input table-input'
            />
          </span>
        </div>
        <select
          className='change-input table-select'
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option className='option' key={pageSize} value={pageSize}>
              Показати {pageSize} рядків
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

const AdminTables = () => {
  const [movieData, setMovieData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/admin/content');
        console.log(response.data)
        const movies = response.data.content.movies.map(movie => ({ ...movie, contentType: 'movie' }));
        const series = response.data.content.series.map(series => ({ ...series, contentType: 'series' }));
        setMovieData(movies);
        setSeriesData(series);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
      }
    };

    fetchData();
  }, []);

  const movieColumns = React.useMemo(
    () => [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Назва', accessor: 'title' },
        { Header: 'Оригінальна назва', accessor: 'title_english' },
        {
            Header: 'Дата релізу',
            accessor: 'release_date',
            Cell: ({ value }) => format(new Date(value), 'dd.MM.yyyy'),
        },
        {
            Header: 'Країна релізу',
            accessor: 'release_country',
        },
        {
            Header: 'Віковий рейтинг',
            accessor: 'age_rating',
            Filter: SelectColumnFilter,
            filter: 'includes',
        },
        {
            Header: 'Тривалість',
            accessor: 'duration_minutes',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
        },
        {
            Header: 'Рейтинг',
            accessor: 'rating',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
        },
        { Header: 'Опис', accessor: 'description' },
        { Header: 'Постер', accessor: 'cover_image' },
        { Header: 'Трейлер', accessor: 'trailer_url' },

      {
        Header: 'Дії',
        accessor: 'actions',
        Cell: ({ row }) => (
          <button className='delete-btn' onClick={() => handleDelete(row.original.id)}>Видалити</button>
        ),
      },
    ],
    []
  );

  const seriesColumns = React.useMemo(
    () => [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Назва', accessor: 'title' },
        { Header: 'Оригінальна назва', accessor: 'title_english' },
        {
            Header: 'Дата релізу',
            accessor: 'release_date',
            Cell: ({ value }) => format(new Date(value), 'dd.MM.yyyy'),
        },
        {
            Header: 'Країна релізу',
            accessor: 'release_country',
        },
        {
            Header: 'Віковий рейтинг',
            accessor: 'age_rating',
            Filter: SelectColumnFilter,
            filter: 'includes',
        },
        {
            Header: 'Тривалість',
            accessor: 'duration_minutes',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
        },
        {
            Header: 'Рейтинг',
            accessor: 'rating',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
        },
        { Header: 'Опис', accessor: 'description' },
        { Header: 'Постер', accessor: 'cover_image' },
        { Header: 'Трейлер', accessor: 'trailer_url' },
        {
            Header: 'Сезонів',
            accessor: 'season',
        },
        {
            Header: 'Серій',
            accessor: 'episodes_count',
        },
        {
            Header: 'Дії',
            accessor: 'actions',
            Cell: ({ row }) => (
            <button onClick={() => handleDelete(row.original.id)}>Видалити</button>
            ),
        },
    ],
    []
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/admin/content/${id}`);
      setMovieData(movieData.filter(movie => movie.id !== id));
      setSeriesData(seriesData.filter(series => series.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении контента:', error);
    }
  };

  return (
    <div className="admin-content">
      <div className='admin-item'>
        <div className="admin-content-table">
          <div className='admin-comment-top'>
            <div className='admin-item-title'>Фільми</div>
            <div className='admin-item-span'>Рядки можна змінювати</div>
          </div>
          <AdminTable columns={movieColumns} data={movieData} />
        </div>
      </div>


      <div className='admin-item'>
        <div className="admin-content-table">
          <div className='admin-comment-top'>
            <div className='admin-item-title'>Серіали</div>
            <div className='admin-item-span'>Рядки можна змінювати</div>
          </div>
          <AdminTable columns={seriesColumns} data={seriesData} />
        </div>
      </div>
    </div>
  );
};

export default AdminTables;
