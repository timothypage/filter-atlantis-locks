// This script runs automatically on the Atlantis page
console.log('Atlantis Filter Extension loaded!');

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

  // Create search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search repositories...';
  searchInput.style.cssText = `
    width: 100%;
    padding: 10px 15px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
  `;

  // Create result counter
  const resultCounter = document.createElement('div');
  resultCounter.style.cssText = `
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    font-family: Arial, sans-serif;
  `;

  searchContainer.appendChild(searchInput);
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

  // Initial counter
  updateCounter(totalRows);

  // Filter function
  function filterLocks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    lockRows.forEach(row => {
      const repoNameElement = row.querySelector('.lock-reponame');
      if (!repoNameElement) {
        row.style.display = 'none';
        return;
      }

      const repoName = repoNameElement.textContent.toLowerCase();
      
      if (searchTerm === '' || repoName.includes(searchTerm)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    updateCounter(visibleCount);
  }

  // Add event listener for search input
  searchInput.addEventListener('input', filterLocks);

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
