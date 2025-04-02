import React, { useState } from 'react';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  FileText,
  Youtube,
  Code,
  Keyboard,
  LifeBuoy,
  FileQuestion,
  Headphones,
  Users,
  Rocket,
  X
} from 'lucide-react';

export function HelpPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    message: ''
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the email to your support system
    window.location.href = `mailto:support@projecthub.com?subject=${encodeURIComponent(emailFormData.subject)}&body=${encodeURIComponent(emailFormData.message)}`;
    setShowEmailForm(false);
  };

  const handleChatClick = () => {
    // In production, this would initialize your chat widget
    setShowChatWidget(true);
    window.open('https://projecthub.com/chat', '_blank');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600">
          Find help and learn more about using ProjectHub
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documentation Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Book className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Documentation</h2>
                  <p className="text-sm text-gray-500">
                    Learn how to use ProjectHub effectively
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href="https://docs.projecthub.com/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Rocket className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Getting Started</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Learn the basics and set up your first workspace
                    </p>
                  </div>
                </a>

                <a 
                  href="https://youtube.com/projecthub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Youtube className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Video Tutorials</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Watch step-by-step guides and tutorials
                    </p>
                  </div>
                </a>

                <a 
                  href="https://api.projecthub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Code className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">API Documentation</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Integrate ProjectHub with your tools
                    </p>
                  </div>
                </a>

                <a 
                  href="https://docs.projecthub.com/shortcuts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Keyboard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Keyboard Shortcuts</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Boost your productivity with shortcuts
                    </p>
                  </div>
                </a>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-4">Popular Articles</h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://docs.projecthub.com/guides/workspace-organization"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm hover:text-blue-600"
                    >
                      <span>How to organize your workspace</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://docs.projecthub.com/guides/team-permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm hover:text-blue-600"
                    >
                      <span>Managing team permissions</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://docs.projecthub.com/guides/automated-workflows"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm hover:text-blue-600"
                    >
                      <span>Setting up automated workflows</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://docs.projecthub.com/guides/task-management"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm hover:text-blue-600"
                    >
                      <span>Best practices for task management</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Headphones className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Contact Support</h2>
                  <p className="text-sm text-gray-500">
                    Get help from our team
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-gray-500">Get help via email</div>
                </div>
              </button>

              <button 
                onClick={handleChatClick}
                className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Live Chat</div>
                  <div className="text-sm text-gray-500">Chat with our team</div>
                </div>
              </button>

              <a 
                href="https://support.projecthub.com/tickets/new"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <FileQuestion className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Submit a Ticket</div>
                  <div className="text-sm text-gray-500">Create a support ticket</div>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Community</h2>
                  <p className="text-sm text-gray-500">
                    Connect with other users
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <a 
                href="https://community.projecthub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <h3 className="font-medium text-gray-900">Community Forum</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ask questions and share tips with other users
                </p>
              </a>

              <a 
                href="https://feedback.projecthub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <h3 className="font-medium text-gray-900">Feature Requests</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Suggest and vote on new features
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Email Support Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Contact Support</h3>
              <button
                onClick={() => setShowEmailForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEmailSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={emailFormData.subject}
                    onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={emailFormData.message}
                    onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}