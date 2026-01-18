import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6 animate-bounce">
                    <AlertTriangle className="h-12 w-12 text-red-600" aria-hidden="true" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight sm:text-5xl">
                    404
                </h1>
                <p className="text-xl font-medium text-gray-900 mb-4">Page not found</p>
                <p className="text-gray-500 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    aria-label="Go back to home page"
                >
                    <Home className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
