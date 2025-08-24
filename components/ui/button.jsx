// components/ui/button.jsx
// A basic button component to be used throughout the app.
// This allows for consistent styling.

export function Button({ onClick, children, variant = 'default', className = '' }) {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        default: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    return (
        <button onClick={onClick} className={`${baseStyles} ${variants[variant]} px-4 py-2 ${className}`}>
            {children}
        </button>
    );
}
