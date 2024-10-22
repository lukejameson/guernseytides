// islands/CollapsibleSection.tsx
import { useState } from 'preact/hooks';

interface CollapsibleSectionProps {
    title: string;
    children: preact.ComponentChildren;
}

export default function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div class='w-full mx-auto'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                class='w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200'
                aria-expanded={isOpen}
            >
                <span class='font-medium'>{title}</span>
                <svg
                    class={`w-5 h-5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        d='M19 9l-7 7-7-7'
                    />
                </svg>
            </button>

            <div
                class={`mt-2 overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-128 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div class='p-4 bg-white rounded-lg border'>
                    {children}
                </div>
            </div>
        </div>
    );
}
