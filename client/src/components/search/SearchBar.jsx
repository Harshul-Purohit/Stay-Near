import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SearchBar = ({ onSearch }) => {
  return (
    <div className='search-bar flex gap-sm items-center'>
      <Input placeholder='Search...' className='flex-1' />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
};

export default SearchBar;
