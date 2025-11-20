import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const [mobileActiveSubMenu, setMobileActiveSubMenu] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality - could redirect to search results page
      console.log('Searching for:', searchQuery);
      // For now, just log. You can implement actual search later
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const [activeDropdownDirection, setActiveDropdownDirection] = useState<'left' | 'right'>('left');

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, menu: string) => {
    // Determine available space and choose to align dropdown to the left or right
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dropdownWidth = 288; // w-72 -> 18rem -> 288px
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const willOverflowRight = rect.left + dropdownWidth > viewportWidth - 12;
      setActiveDropdownDirection(willOverflowRight ? 'right' : 'left');
    } catch (err) {
      setActiveDropdownDirection('left');
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
    setActiveSubDropdown(null);
  };

  const [activeSubDropdownDirection, setActiveSubDropdownDirection] = useState<'left' | 'right'>('right');

  const handleSubMenuEnter = (e: React.MouseEvent<HTMLDivElement>, submenu: string) => {
    // Decide whether nested submenu should open to the right or flip to the left
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const nestedWidth = 256; // w-64 -> 16rem -> 256px
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const willOverflowRight = rect.right + nestedWidth > viewportWidth - 12;
      setActiveSubDropdownDirection(willOverflowRight ? 'left' : 'right');
    } catch (err) {
      setActiveSubDropdownDirection('right');
    }
    setActiveSubDropdown(submenu);
  };

  const handleSubMenuLeave = () => {
    setActiveSubDropdown(null);
  };

  const toggleMobileMenu = (menuName: string) => {
    setMobileActiveMenu(mobileActiveMenu === menuName ? null : menuName);
    setMobileActiveSubMenu(null);
  };

  const toggleMobileSubMenu = (submenuName: string) => {
    setMobileActiveSubMenu(mobileActiveSubMenu === submenuName ? null : submenuName);
  };

  const navigation = [
    {
      name: 'About Labuan FSA',
      href: '#about',
      submenu: [
        { 
          name: 'The Regulator', 
          href: '#regulator',
          submenu: [
            { name: 'Functions of Labuan FSA', href: '#functions' },
            { name: 'Authority Members', href: '#authority-members' },
            { name: 'Audit & Risk Management Committee (ARMC)', href: '#armc' },
            { name: 'Nomination & Remuneration Committee (NRC)', href: '#nrc' },
            { name: 'Consultative Bodies', href: '#consultative-bodies' },
            { name: 'Guideline on Whistleblowing', href: '#whistleblowing' },
            { name: 'International Membership', href: '#international-membership' },
            { name: 'Memoranda of Understanding', href: '#mou' },
          ]
        },
      ],
    },
    {
      name: 'Areas of Business',
      href: '#business',
      submenu: [
        { 
          name: 'Financial Services', 
          href: '#financial-services',
          submenu: [
            { name: 'Banking', href: 'banking' },
            { name: 'Insurance', href: '#insurance-services' },
            { name: 'Leasing', href: '#leasing' },
            { name: 'Money Broking', href: '#money-broking' },
            { name: 'Commodity Trading', href: '#commodity-trading' },
            { name: 'Credit Token Companies', href: '#credit-token-companies' },
            { name: 'Company Management Business', href: '#company-management-business' },
            { name: 'Wealth Management', href: '#wealth-management' },
            { name: 'Digital Financial Services', href: '#digital-financial-services' },
            { name: 'Capital Markets', href: '#capital-markets-services' },
            { name: 'Exchange', href: '#exchange' },
          ]
        },
        { 
          name: 'Labuan Structures', 
          href: '#structures',
          submenu: [
            { name: 'Labuan Companies', href: '#labuan-companies-structures' },
            { name: 'Protected Cell Companies', href: '#protected-cell-companies' },
            { name: 'Partnerships', href: '#partnerships' },
          ]
        },
        { 
          name: 'Labuan Service Providers', 
          href: '#service-providers',
          submenu: [
            { name: 'Trust Companies and Ancillary Services', href: '#trust-companies-services' },
            { name: 'Listing of Shariah Advisers', href: '#shariah-advisers' },
          ]
         },
         { 
          name: 'Regulatory Reporting', 
          href: '#regulatory-reporting',
          submenu: [
            { name: 'Statistical Management System (SMS)', href: '#sms' },
            { name: 'External Assets & Liabilities (EAL) Reporting', href: '#eal-reporting' },
            { name: 'SMS Portal', href: '#sms-portal' },
          ]
         },
        { name: 'Forms', href: '#forms' },
      ],
    },
    {
      name: 'Legislation & Guidelines',
      href: '#legislation',
      submenu: [
        { 
          name: 'Legislation', 
          href: '#legislation-section',
          submenu: [
            { name: 'Legislation', href: '#legislation-list' },
            { name: 'Relevant Applicable Acts', href: '#relevant-applicable-acts' }
          ]
        },
        { 
          name: 'Guidelines', 
          href: '#guidelines',
          submenu: [
            { name: 'General', href: '#general' },
            { name: 'Banking', href: '#banking-guidelines' },
            { name: 'Insurance', href: '#insurance-guidelines' },
            { name: 'Trust Companies', href: '#trust-companies-guidelines' },
            { name: 'Labuan Companies', href: '#labuan-companies-guidelines' },
            { name: 'Capital Markets', href: '#capital-markets-guidelines' },
            { name: 'Islamic Business', href: '#islamic-business' },
            { name: 'Other Businesses', href: '#other-businesses' },
            { name: 'Tax-Related Matters', href: '#tax-related-matters' },
          ]
        },
        { 
          name: 'Public Consultation Papers', 
          href: '#public-consultation-papers',
          submenu: [
            { name: 'Consultation Paper', href: '#consultation-paper' },
            { name: 'Exposure Draft', href: '#exposure-draft' },
          ]
        },
      ],
      
    },
    {
      name: 'General Info',
      href: '#general',
      submenu: [
        { name: 'General Notification', href: '#notifications' },
        { name: 'Communication on Covid-19', href: '#communications-covid-19' },
        { name: 'Pictures of Labuan FSA Past Events/ Programmes', href: '#pictures-past-events' },
        { name: 'Presentation Slides / Videos', href: '#presentation-slides-videos' },
        { name: 'Publications', href: '#publications' },
        { name: 'Investor Alerts', href: '#investor-alerts' },
        { name: 'Media', href: '#media' },
        {
          name: 'Procurement', 
          href: '#procurement',
          submenu: [
            { name: 'Request for Tender / Proposal', href: '#request-for-tender-proposal' },
            { name: 'Request for Quotation', href: '#request-for-quotation' },
            { name: 'Vendor Registration', href: '#vendor-registration' },
            { name: 'Quotation Result', href: '#quotation-result' },
            { name: 'Tender Result', href: '#tender-result' },
          ]
        },
      ],
    },
    {
      name: 'AML/CFT',
      href: '#aml',
      submenu: [
        { name: 'AML & CFT Compliance', href: '#aml-compliance' },
        { name: 'Guidelines, Directives & Circulars', href: '#aml-guidelines' },
        { name: 'Enforcement Actions on Labuan Licensed Entities for AML/CFT Related Non-Compliances', href: '#aml-enforcement' },
      ],
    },
    {
      name: 'Contact Us',
      href: '#contact',
      submenu: [
        { name: 'Enquiries / Complaints', href: '#enquiries' },
        { name: 'Senior Management Directory', href: '#management' },
        { name: 'Careers', href: '#careers' },
      ],
    },
  ];

  return (
    <header className="bg-white fixed top-0 left-0 right-0 z-50 shadow-md">
      {/* First Row: Logo, Search Bar, and Buttons */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <img 
                src="/logo_lfsa.png" 
                alt="Labuan FSA - Financial Services Authority" 
                className="h-14 w-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
              />
            </Link>

            {/* Desktop: Search Bar & Buttons */}
            <div className="hidden lg:flex items-center gap-4 flex-1 justify-end ml-8">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-64 pl-10 pr-10 py-2 text-xs font-medium bg-gray-100 border border-gray-400 text-gray-800 placeholder-gray-600 rounded focus:outline-none focus:bg-white focus:border-gray-600 transition-all duration-200"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>

              {/* Action Buttons */}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black border border-slate-800 rounded transition-all flex items-center gap-1.5 uppercase tracking-wider shadow-sm hover:shadow-md"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs font-bold rounded hover:from-blue-800 hover:to-blue-950 transition-all duration-200 flex items-center gap-1.5 uppercase tracking-wider shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                E-Submission
              </Link>
            </div>

            {/* Mobile Icons */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation Menu */}
      <div className="bg-white hidden lg:block border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-0.5">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <a
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:text-blue-700 hover:bg-gray-100 transition-all duration-200 uppercase tracking-widest"
                  >
                    {item.name}
                  </a>

                  {/* Dropdown Menu */}
                  {item.submenu && activeDropdown === item.name && (
                    <div className={`absolute ${activeDropdownDirection === 'right' ? 'right-0' : 'left-0'} top-full w-72 bg-white shadow-xl border border-gray-300 mt-0 z-50 rounded-lg`}>
                      <div className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 border-b border-gray-700 rounded-t-lg">
                        <p className="text-xs font-bold text-white uppercase tracking-widest">{item.name}</p>
                      </div>
                      {item.submenu.map((subitem: any) => (
                        <div
                          key={subitem.name}
                          className="relative"
                          onMouseEnter={(e) => handleSubMenuEnter(e, subitem.name)}
                          onMouseLeave={handleSubMenuLeave}
                        >
                          <a
                            href={subitem.href}
                            className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-700 border-b border-gray-100 last:border-0 transition-all duration-150 group"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-2 h-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              <span className="group-hover:translate-x-1 transition-transform duration-150">{subitem.name}</span>
                            </div>
                            {subitem.submenu && (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </a>
                          
                          {/* Nested Dropdown Menu */}
                          {subitem.submenu && activeSubDropdown === subitem.name && (
                            <div className={`${activeSubDropdownDirection === 'left' ? 'absolute right-full' : 'absolute left-full'} top-0 w-64 bg-white shadow-xl border border-gray-300 ml-0 z-50 rounded-lg`}>
                              <div className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 border-b border-gray-700 rounded-t-lg">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">{subitem.name}</p>
                              </div>
                              {subitem.submenu.map((nestedItem: any) => (
                                <a
                                  key={nestedItem.name}
                                  href={nestedItem.href}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-700 border-b border-gray-100 last:border-0 transition-all duration-150 group"
                                >
                                  <svg className="w-2 h-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx="4" cy="4" r="3" />
                                  </svg>
                                  <span className="group-hover:translate-x-1 transition-transform duration-150">{nestedItem.name}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="lg:hidden bg-gray-50 border-t-2 border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH WEBSITE..."
                  className="w-full pl-12 pr-12 py-3 text-sm font-semibold bg-white border-2 border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:border-blue-600"
                  autoFocus
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t-2 border-gray-200 shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {navigation.map((item) => (
              <div key={item.name} className="py-2 border-b-2 border-gray-100 last:border-0">
                <button
                  onClick={() => item.submenu ? toggleMobileMenu(item.name) : window.location.href = item.href}
                  className="w-full flex items-center justify-between px-3 py-3 text-base font-bold text-gray-800 hover:text-blue-600 uppercase tracking-wide transition-colors"
                >
                  <span>{item.name}</span>
                  {item.submenu && (
                    <svg 
                      className={`w-5 h-5 transition-transform ${mobileActiveMenu === item.name ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                {item.submenu && mobileActiveMenu === item.name && (
                  <div className="pl-4 mt-2 space-y-1 pb-2">
                    {item.submenu.map((subitem: any) => (
                      <div key={subitem.name}>
                        <button
                          onClick={() => subitem.submenu ? toggleMobileSubMenu(subitem.name) : window.location.href = subitem.href}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border-l-2 border-transparent hover:border-blue-600"
                        >
                          <span>{subitem.name}</span>
                          {subitem.submenu && (
                            <svg 
                              className={`w-4 h-4 transition-transform ${mobileActiveSubMenu === subitem.name ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                        {subitem.submenu && mobileActiveSubMenu === subitem.name && (
                          <div className="pl-4 mt-1 space-y-1 pb-2">
                            {subitem.submenu.map((nestedItem: any) => (
                              <a
                                key={nestedItem.name}
                                href={nestedItem.href}
                                className="block px-4 py-2 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border-l-2 border-transparent hover:border-blue-600"
                              >
                                {nestedItem.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Action Buttons */}
            <div className="mt-6 space-y-3 px-3">
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-800 text-sm font-bold border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-wide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg uppercase tracking-wide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                E-Submission
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
