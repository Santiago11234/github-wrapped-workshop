import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserStats, processUserStats } from './githubApi';
import './GitHubWrapped.css';

const GitHubWrapped = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [token, setToken] = useState('');

  const fetchStats = async (user, userToken) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getUserStats(user, userToken);
      const processedStats = processUserStats(userData);
      setStats({ ...processedStats, ...userData });
      setUsername(user);
      setToken(userToken);
      setCurrentSlide(0);
    } catch (err) {
      setError(err.message || 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim() && inputToken.trim()) {
      fetchStats(inputUsername.trim(), inputToken.trim());
    } else {
      setError('Please enter both username and token');
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  if (!username) {
    return (
      <div className="wrapped-container">
        <motion.div
          className="intro-slide"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>GitHub Wrapped 2025</h1>
          <p>Discover your year in code</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="username-input"
            />
            <input
              type="password"
              placeholder="Enter GitHub Personal Access Token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="username-input"
            />
            <p className="token-help">
              Need a token? <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">Create one here</a>
            </p>
            <button type="submit" className="submit-button">
              View My Wrapped
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wrapped-container">
        <motion.div
          className="loading-slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loader"></div>
          <p>Loading your GitHub story...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapped-container">
        <div className="error-slide">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => setUsername('')}>Try Again</button>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Welcome
    <div className="slide welcome-slide">
      <h1>{stats.name || username}'s</h1>
      <h2>GitHub Wrapped</h2>
      <p className="year">2025</p>
    </div>,

    // Slide 2: Total Contributions
    <div className="slide stats-slide">
      <h2>You made</h2>
      <div className="big-number">{stats.totalContributions}</div>
      <p className="stat-label">contributions this year</p>
      <p className="detail">That's dedication!</p>
    </div>,

    // Slide 3: Commits
    <div className="slide stats-slide">
      <h2>You committed</h2>
      <div className="big-number">{stats.totalCommits}</div>
      <p className="stat-label">times</p>
      <p className="detail">Building the future, one commit at a time</p>
    </div>,

    // Slide 4: Top Language
    <div className="slide language-slide">
      <h2>Your top language</h2>
      {stats.topLanguages.length > 0 && (
        <>
          <div
            className="language-badge"
            style={{ backgroundColor: stats.topLanguages[0].color }}
          >
            {stats.topLanguages[0].name}
          </div>
          <p className="stat-label">{stats.topLanguages[0].percentage}% of your code</p>
        </>
      )}
    </div>,

    // Slide 5: All Languages
    <div className="slide languages-breakdown-slide">
      <h2>Your language breakdown</h2>
      <div className="languages-list">
        {stats.topLanguages.map((lang) => (
          <div key={lang.name} className="language-item">
            <div className="language-info">
              <span
                className="language-dot"
                style={{ backgroundColor: lang.color }}
              ></span>
              <span className="language-name">{lang.name}</span>
            </div>
            <span className="language-percent">{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>,

    // Slide 6: Most Productive Day
    <div className="slide stats-slide">
      <h2>Most productive on</h2>
      <div className="big-text">{stats.mostProductiveDay[0]}</div>
      <p className="stat-label">{stats.mostProductiveDay[1]} contributions</p>
    </div>,

    // Slide 7: Pull Requests
    <div className="slide stats-slide">
      <h2>You opened</h2>
      <div className="big-number">{stats.totalPRs}</div>
      <p className="stat-label">pull requests</p>
      <p className="detail">Collaboration at its finest</p>
    </div>,

    // Slide 8: Streak
    <div className="slide stats-slide">
      <h2>Longest streak</h2>
      <div className="big-number">{stats.maxStreak}</div>
      <p className="stat-label">days in a row</p>
      <p className="detail">Consistency is key!</p>
    </div>,

    // Slide 9: Top Repos
    stats.topRepos.length > 0 && (
      <div className="slide repos-slide">
        <h2>Your starred repos</h2>
        <div className="repos-list">
          {stats.topRepos.slice(0, 3).map((repo) => (
            <div key={repo.name} className="repo-item">
              <span className="repo-name">{repo.name}</span>
              <span className="repo-stars">⭐ {repo.stargazerCount}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    // Slide 10: Final
    <div className="slide final-slide">
      <h2>What a year!</h2>
      <p>Keep building amazing things in 2025</p>
      <button onClick={() => {
        setUsername('');
        setToken('');
        setInputUsername('');
        setInputToken('');
      }} className="restart-button">
        View Another Profile
      </button>
    </div>,
  ].filter(Boolean);

  return (
    <div className="wrapped-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="slide-wrapper"
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
          {slides[currentSlide]}
        </motion.div>
      </AnimatePresence>

      <div className="navigation">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="nav-button"
        >
          ← Previous
        </button>
        <span className="slide-counter">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="nav-button"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default GitHubWrapped;
