// This script runs automatically on the Atlantis page
console.log('Atlantis Filter Extension loaded!');

// LocalStorage key for persisting search term
const STORAGE_KEY = 'atlantis-filter-search-term';

// Wait for the page to be fully loaded
function init() {
  // Find the locks section
  const locksSection = document.querySelector('.lock-grid');
  if (!locksSection) {
    console.log('Lock grid not found, retrying...');
    setTimeout(init, 500);
    return;
  }

  // Create search box container
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    margin: 20px 0;
    padding: 15px;
    background: #f4f4f4;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  `;

  // Create input wrapper for flexbox layout
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = `
    display: flex;
    gap: 10px;
    align-items: center;
  `;

  // Create search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search repositories (and optionally workspace)...';
  searchInput.style.cssText = `
    flex: 1;
    padding: 10px 15px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
  `;

  // Create clear button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.style.cssText = `
    font-size: 16px;
    background: #84c3feff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    font-weight: bold;
    transition: background 0.2s;
  `;

  // Add hover effect
  clearButton.addEventListener('mouseenter', () => {
    clearButton.style.background = '#52a0ffff';
  });
  clearButton.addEventListener('mouseleave', () => {
    clearButton.style.background = '#9cbbff0e';
  });

  // Create result counter
  const resultCounter = document.createElement('div');
  resultCounter.style.cssText = `
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    font-family: Arial, sans-serif;
  `;

  inputWrapper.appendChild(searchInput);
  inputWrapper.appendChild(clearButton);
  searchContainer.appendChild(inputWrapper);
  searchContainer.appendChild(resultCounter);

  // Insert search box before the lock grid
  locksSection.parentNode.insertBefore(searchContainer, locksSection);

  // Get all lock rows (excluding the header)
  const lockRows = Array.from(document.querySelectorAll('.lock-row'));
  const totalRows = lockRows.length;

  // Update counter display
  function updateCounter(visibleCount) {
    if (searchInput.value.trim() === '') {
      resultCounter.textContent = `Showing all ${totalRows} locks`;
    } else {
      resultCounter.textContent = `Showing ${visibleCount} of ${totalRows} locks`;
    }
  }

  // Filter function
  function filterLocks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const searchParts = searchTerm.split(/\s+/); // Split on whitespace
    const repoFilter = searchParts[0] || '';
    const workspaceFilter = searchParts[1] || '';
    
    let visibleCount = 0;

    lockRows.forEach(row => {
      const repoNameElement = row.querySelector('.lock-reponame');
      if (!repoNameElement) {
        row.style.display = 'none';
        return;
      }

      const repoName = repoNameElement.textContent.toLowerCase();
      
      // Check if repository matches the first filter term
      const repoMatches = repoFilter === '' || repoName.includes(repoFilter);
      
      if (repoMatches) {
        row.style.display = '';
        visibleCount++;
        
        // If there's a second filter term, check workspace and highlight if it matches
        if (workspaceFilter) {
          // Find the workspace code element (3rd link's code element)
          const links = row.querySelectorAll('a.lock-link');
          const workspaceLink = links[2]; // 3rd link (0-indexed)
          const workspaceCodeElement = workspaceLink ? workspaceLink.querySelector('code') : null;
          const workspaceText = workspaceCodeElement ? workspaceCodeElement.textContent.toLowerCase() : '';
          
          if (workspaceCodeElement && workspaceText.includes(workspaceFilter)) {
            workspaceCodeElement.style.background = 'lightgreen';
          } else if (workspaceCodeElement) {
            workspaceCodeElement.style.background = '';
          }
        } else {
          // Clear any existing highlights when no workspace filter
          const links = row.querySelectorAll('a.lock-link');
          const workspaceLink = links[2];
          const workspaceCodeElement = workspaceLink ? workspaceLink.querySelector('code') : null;
          if (workspaceCodeElement) {
            workspaceCodeElement.style.background = '';
          }
        }
      } else {
        row.style.display = 'none';
      }
    });

    updateCounter(visibleCount);
    
    // Save search term to localStorage
    localStorage.setItem(STORAGE_KEY, searchInput.value);
  }

  // Restore saved search term from localStorage
  const savedSearchTerm = localStorage.getItem(STORAGE_KEY);
  if (savedSearchTerm) {
    searchInput.value = savedSearchTerm;
  }

  // Initial counter and filter (apply saved search if exists)
  filterLocks();

  // Add event listener for search input
  searchInput.addEventListener('input', filterLocks);

  // Add event listener for clear button
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    filterLocks();
    searchInput.focus();
  });

  // Focus on search box when pressing '/' key
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  console.log(`Atlantis Filter Extension: Search box added. Found ${totalRows} lock rows.`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
