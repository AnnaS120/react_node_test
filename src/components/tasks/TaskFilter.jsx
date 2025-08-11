/**
 * TaskFilter Component
 * 
 * A comprehensive task filtering component that allows users to filter tasks
 * by completion status and search by title. Implements real-time filtering
 * with localStorage integration for persistent data access.
 * 
 * Features:
 * - Filter tasks by completion status (All/Complete/Incomplete)
 * - Search tasks by title with real-time results
 * - Responsive design with mobile optimization
 * - Accessibility support with ARIA attributes
 * - Integration with localStorage for data persistence
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaSpinner, FaExclamationTriangle, FaTasks } from 'react-icons/fa';
import TaskList from './TaskList';

const TaskFilter = () => {
  // State management with proper initialization
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [counts, setCounts] = useState({
    all: 0,
    complete: 0,
    incomplete: 0
  });

  /**
   * Load tasks from localStorage
   * Uses localStorage for cross-component data sharing
   */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Simulate network delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get tasks from localStorage
        const storedTasks = localStorage.getItem('tasks');
        
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
          
          // Apply initial filtering
          applyFilters(parsedTasks, filters);
          
          // Calculate counts
          updateCounts(parsedTasks);
        } else {
          // Initialize with empty array if no tasks exist
          setTasks([]);
          setFilteredTasks([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    
    // Set up event listener for storage changes from other components
    const handleStorageChange = (e) => {
      if (e.key === 'tasks') {
        try {
          const updatedTasks = JSON.parse(e.newValue || '[]');
          // Update tasks; filtering & counts are handled by the effect below
          setTasks(updatedTasks);
        } catch (err) {
          console.error('Error parsing tasks from storage:', err);
        }
      }
    };
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Recompute filtered results and counts whenever tasks or filters change
  useEffect(() => {
    applyFilters(tasks, filters);
    updateCounts(tasks);
  }, [tasks, filters, applyFilters]);

  /**
   * Update task counts by status
   * 
   * @param {Array} taskList - List of tasks to count
   */
  const updateCounts = (taskList) => {
    const completeTasks = taskList.filter(task => task.status === 'complete').length;
    const incompleteTasks = taskList.filter(task => task.status === 'incomplete').length;
    
    setCounts({
      all: taskList.length,
      complete: completeTasks,
      incomplete: incompleteTasks
    });
  };

  /**
   * Apply filters to tasks based on current filter settings
   * Memoized with useCallback to prevent unnecessary re-renders
   * 
   * @param {Array} taskList - List of tasks to filter
   * @param {Object} filterSettings - Current filter settings
   */
  const applyFilters = useCallback((taskList, filterSettings) => {
    let result = [...taskList];
    
    // Apply status filter
    if (filterSettings.status !== 'all') {
      result = result.filter(task => task.status === filterSettings.status);
    }
    
    // Apply search filter
    if (filterSettings.search.trim()) {
      const searchTerm = filterSettings.search.toLowerCase().trim();
      result = result.filter(task => 
        String(task.title || '').toLowerCase().includes(searchTerm) || 
        String(task.description || '').toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredTasks(result);
  }, []);

  /**
   * Handle filter changes
   * 
   * @param {string} filterType - Type of filter to change
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    // Filtering will be reapplied by the effect watching [tasks, filters]
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center" aria-live="polite" role="status">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" aria-hidden="true" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center" aria-live="assertive" role="alert">
        <FaExclamationTriangle className="mr-2" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <FaTasks className="mr-2" aria-hidden="true" />
        Task Filter
      </h2>
      
      <div className="mb-6 space-y-4">
        {/* Search input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Tasks
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              type="text"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by title or description"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              aria-label="Search tasks"
            />
          </div>
        </div>
        
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" aria-hidden="true" />
            </div>
            <select
              id="status-filter"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-label="Filter tasks by status"
            >
              <option value="all">All Tasks ({counts.all})</option>
              <option value="complete">Complete ({counts.complete})</option>
              <option value="incomplete">Incomplete ({counts.incomplete})</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>
      
      {/* Task list */}
      <TaskList
        tasks={filteredTasks}
        allTasks={tasks}
        onTasksChange={setTasks}
      />
    </div>
  );
};

export default TaskFilter;
