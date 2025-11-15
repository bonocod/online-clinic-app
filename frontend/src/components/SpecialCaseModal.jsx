// frontend/src/components/SpecialCaseModal.jsx
import React from 'react';

const SpecialCaseModal = ({ isOpen, onClose, caseName, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{caseName}</h3>
        <p className="mb-6 text-sm text-gray-600">
          What would you like to do?
        </p>
        <div className="space-y-3">
          <button
            onClick={() => onSelect('has')}
            className="w-full bg-red-500 text-white p-3 rounded font-medium"
          >
            I have this
          </button>
          <button
            onClick={() => onSelect('info')}
            className="w-full bg-blue-500 text-white p-3 rounded font-medium"
          >
            Just want info
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 p-3 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialCaseModal;