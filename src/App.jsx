import * as React from 'react';

  const storiesReducer = (state, action) => {
    switch (action.type) {
      case 'STORIES_FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
        case 'STORIES_FETCH_FAILURE':
          return {
            ...state,
            isLoading: false,
            isError: true,
          };
        case 'REMOVE_STORY':
          return {
            ...state,
            data: state.date.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
          };
      default:
        throw new Error();
    }
  };

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState 
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

// A - First Step for Data Fetching with React
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
    
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false}
  );

  React.useEffect(() => {
    // if `searchTerm` is not present
    // e.g. null, empty string, undefined
    // do nothing
    // more generalized condition than searchTerm === ''

    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    fetch(`${API_ENDPOINT}${searchTerm}`) // B - Second Step for Data Fetching with React
      .then((response) => response.json()) // C - Third Step for Data Fetching with React
      .then((result) => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.hits, // D - Fourth Step for Data Fetching with React
        });
    })
    .catch(() => 
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    ); 
},  [searchTerm]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
      <div>
        <h1>My Hacker Stories</h1>

        <InputWithLabel
          id= "search"
          value={searchTerm}
          isFocused
          onInputChange={handleSearch} 
          >
          <strong> Search: </strong>
        </InputWithLabel>

          <hr />

          {stories.isError && <p>Something went wrong...</p>}

          {stories.isLoading ? (
            <p> Loading ...</p>
          ) : (
            <List 
              list={stories.data} 
              onRemoveItem={handleRemoveStory}
            />
          )}
    </div>
  );
};

const InputWithLabel = ({ 
  id, 
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
    const inputRef= React.useRef(); // A

    React.useEffect(() => { // C
      if (isFocused && inputRef.current) {
      inputRef.current.focus(); // D
    }
  }, [isFocused]); 
      
  return (
    <>
      <label htmlFor={id}>{children} </label>  {/* B */}

      <input 
        ref={inputRef}
        id= {id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item 
      key={item.objectID} 
      item={item}
      onRemoveItem={onRemoveItem} 
      />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span> by {item.author} </span>
    <span>{item.num_comments} </span>
    <span>{item.points}</span>
    <span> 
      <button type="button" onClick= {() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </li>
  );

export default App;