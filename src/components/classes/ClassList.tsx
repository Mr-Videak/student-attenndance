
import React, { useState } from 'react';
import { Class } from '@/utils/data';
import ClassCard from './ClassCard';
import SearchBar from '../ui/SearchBar';
import EmptyState from '../ui/EmptyState';
import { ClipboardList } from 'lucide-react';

interface ClassListProps {
  classes: Class[];
}

const ClassList = ({ classes }: ClassListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter classes based on search query
  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handler for search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search classes by name, section or batch..."
        />
      </div>
      
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <ClassCard key={cls.id} classData={cls} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Classes Found"
          description={
            searchQuery
              ? `No classes matching "${searchQuery}"`
              : "You haven't added any classes yet."
          }
          icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />}
        />
      )}
    </div>
  );
};

export default ClassList;
