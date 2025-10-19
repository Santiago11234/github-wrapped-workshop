import React, { useState } from 'react';
import axios from 'axios';
import './GitHubWrapped.css';

const GitHubWrapped = () => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchGitHubData = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Set up headers for authenticated requests
      const headers = {};
      if (token.trim()) {
        headers.Authorization = `token ${token}`;
        setIsAuthenticated(true);
      }
      
      // TODO: Fetch user data from `https://api.github.com/users/...`, look at the GitHub API docs to learn more.
      const userResponse = await {}; // CHANGE THIS
      setUserData(userResponse.data);
      
      // Fetch user repositories (includes private repos if authenticated)
      const reposUrl = token.trim() 
        ? `https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner`
        : `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;
      
      const reposResponse = await axios.get(reposUrl, { headers });
      setRepos(reposResponse.data);
      
      setShowResults(true);
      setCurrentSlide(0);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid token. Please check your GitHub Personal Access Token.');
      } else if (err.response?.status === 404) {
        setError('User not found. Please check the username and try again.');
      } else if (err.response?.status === 403) {
        setError('Rate limit exceeded. Please try again later.');
      } else {
        setError('An error occurred while fetching data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTopLanguages = () => {
    const languageCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        // TODO: update the count of each language found
        languageCount[repo.language] = -1;
      }
    });
    
    return Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopRepos = () => {
    return repos
      .sort((a, b) => {
        // First sort by most recently updated
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);
        
        if (dateB.getTime() !== dateA.getTime()) {
            // TODO: return the value that will sort the repos by most recently updated
          return -1;
        }
        
        // If same update date, sort by stars as tiebreaker
        return b.stargazers_count - a.stargazers_count;
      })
      .slice(0, 3);
  };

  const getMostRecentRepo = () => {
    if (repos.length === 0) return null;
    // TODO: return the most recently updated repo
    // hint: you can use similar logic to getTopRepos
    return null;
  };

  const nextSlide = () => {
    if (currentSlide < 4) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const resetWrapped = () => {
    setShowResults(false);
    setCurrentSlide(0);
    setUserData(null);
    setRepos([]);
    setUsername('');
    setToken('');
    setIsAuthenticated(false);
  };

  if (!showResults) {
    return (
      <div className="github-wrapped">
        <div className="welcome-screen">
          <h1>🎵 GitHub Wrapped 2025 🎵</h1>
          <p>Discover your GitHub year in review</p>
          
          <div className="input-section">
            <input
               type="text"
               placeholder="Enter your GitHub username"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               onKeyPress={(e) => {}} // TODO: call fetchGitHubData when the user presses Enter
               className="username-input"
               autoComplete="off"
               autoCorrect="off"
               autoCapitalize="off"
               spellCheck="false"
               data-form-type="other"
             />
            <input
               type="password"
               placeholder="GitHub Personal Access Token (optional, for private repos)"
               value={token}
               onChange={(e) => setToken(e.target.value)}
               onKeyPress={(e) => {}} // TODO: call fetchGitHubData when the user presses Enter
               className="password-input"
               autoComplete="new-password"
               autoCorrect="off"
               autoCapitalize="off"
               spellCheck="false"
               data-form-type="other"
             />
            <div className="token-info">
              <p><strong>Tip:</strong> Add your GitHub token to see private repositories and get more accurate data!</p>
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="token-link"
              >
                Create GitHub Token →
              </a>
            </div>
            <button 
              onClick={() => {}} // TODO: call fetchGitHubData when clicked
              disabled={loading || !username.trim()}
              className="generate-btn"
            >
              {loading ? 'Generating...' : 'Generate Wrapped'}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  const slides = [
         // Slide 1: Welcome
     <div key="welcome" className="slide welcome-slide">
       <h2>Your GitHub Wrapped 2025</h2>
       <div className="user-info">
         <img src={userData.avatar_url} alt={userData.name} className="avatar" />
         <h3>{userData.name || userData.login}</h3>
         <p>{userData.bio || 'No bio available'}</p>
         {isAuthenticated && (
           <div className="auth-badge">
            Private Access Enabled
           </div>
         )}
       </div>
     </div>,

    // Slide 2: Repository Stats
    <div key="stats" className="slide stats-slide">
      <h2>Your Repository Stats</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{repos.length}</div>
          <div className="stat-label">Total Repositories</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}</div>
          <div className="stat-label">Total Stars</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{repos.reduce((sum, repo) => sum + repo.forks_count, 0)}</div>
          <div className="stat-label">Total Forks</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{repos.filter(repo => repo.fork).length}</div>
          <div className="stat-label">Forked Repos</div>
        </div>
      </div>
    </div>,

    // Slide 3: Top Languages
    <div key="languages" className="slide languages-slide">
      <h2>Your Top Programming Languages</h2>
      <div className="languages-list">
        {getTopLanguages().map(([language, count], index) => (
          <div key={language} className="language-item">
            <div className="language-rank">#{index + 1}</div>
            <div className="language-name">{language}</div>
            <div className="language-count">{count} repos</div>
          </div>
        ))}
      </div>
    </div>,

         // Slide 4: Top Repositories
     <div key="top-repos" className="slide top-repos-slide">
       <h2>Your Most Active Repositories</h2>
       <div className="repos-list">
         {getTopRepos().map((repo, index) => (
           <div key={repo.id} className="repo-item">
             <div className="repo-rank">#{index + 1}</div>
             <div className="repo-info">
               <div className="repo-name">{repo.name}</div>
               <div className="repo-description">{repo.description || 'No description'}</div>
               <div className="repo-stats">
                Updated: {new Date(repo.updated_at).toLocaleDateString()} • ⭐ {repo.stargazers_count} • 🍴 {repo.forks_count}
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>,

    // Slide 5: Final Summary
    <div key="summary" className="slide summary-slide">
      <h2>🎉 Thanks for the amazing year!</h2>
      <div className="summary-content">
        <p>You've been coding like a rockstar!</p>
        <p>Keep building amazing things and inspiring others!</p>
                 <div className="final-stats">
           <div className="final-stat">
             <span className="final-number">{repos.length}</span>
             <span className="final-label">repositories created</span>
           </div>
           <div className="final-stat">
             <span className="final-number">{getMostRecentRepo()?.name || 'N/A'}</span>
             <span className="final-label">most recently updated</span>
           </div>
         </div>
      </div>
      <button onClick={resetWrapped} className="restart-btn">
        Generate Another Wrapped
      </button>
    </div>
  ];

  return (
    <div className="github-wrapped">
      <div className="wrapped-container">
        {slides[currentSlide]}
        
        <div className="navigation">
          {currentSlide > 0 && (
            <button onClick={prevSlide} className="nav-btn prev-btn">
              ← Previous
            </button>
          )}
          
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <span 
                key={index} 
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          
          {currentSlide < slides.length - 1 && (
            <button onClick={nextSlide} className="nav-btn next-btn">
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubWrapped;
