import React, { useState } from 'react';

const BulkActions = ({ selectedItems, onBulkDelete, onBulkEmail, onClearSelection }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const handleBulkEmail = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Please fill in both subject and message');
      return;
    }
    onBulkEmail(emailSubject, emailMessage);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailMessage('');
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-blue-800 font-medium">
          {selectedItems.length} item(s) selected
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            📧 Email All
          </button>
          <button
            onClick={onBulkDelete}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            🗑️ Delete All
          </button>
          <button
            onClick={onClearSelection}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Send Bulk Email</h3>
            <input
              type="text"
              placeholder="Email Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <textarea
              placeholder="Email Message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              className="w-full p-2 border rounded mb-4 h-32"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleBulkEmail}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send Email
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;