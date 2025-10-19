import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/graphql';

// GraphQL query to get comprehensive user stats
export const getUserStats = async (username, token, year = new Date().getFullYear()) => {
  const githubClient = axios.create({
    baseURL: GITHUB_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year}-12-31T23:59:59Z`;

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        name
        login
        avatarUrl
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
        }
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
        followers {
          totalCount
        }
      }
    }
  `;

  try {
    const response = await githubClient.post('', {
      query,
      variables: {
        username,
        from: startDate,
        to: endDate,
      },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
};

// Process the raw data into useful metrics
export const processUserStats = (userData) => {
  const { contributionsCollection, repositories } = userData;

  // Calculate language statistics
  const languageStats = {};
  repositories.nodes.forEach((repo) => {
    repo.languages.edges.forEach((lang) => {
      if (!languageStats[lang.node.name]) {
        languageStats[lang.node.name] = {
          name: lang.node.name,
          color: lang.node.color,
          size: 0,
        };
      }
      languageStats[lang.node.name].size += lang.size;
    });
  });

  const totalSize = Object.values(languageStats).reduce((sum, lang) => sum + lang.size, 0);
  const topLanguages = Object.values(languageStats)
    .map((lang) => ({
      ...lang,
      percentage: ((lang.size / totalSize) * 100).toFixed(1),
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  // Find most productive day/month
  const contributionsByDay = {};
  const contributionsByMonth = {};

  contributionsCollection.contributionCalendar.weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = date.toLocaleDateString('en-US', { month: 'long' });

      contributionsByDay[dayName] = (contributionsByDay[dayName] || 0) + day.contributionCount;
      contributionsByMonth[month] = (contributionsByMonth[month] || 0) + day.contributionCount;
    });
  });

  const mostProductiveDay = Object.entries(contributionsByDay)
    .sort((a, b) => b[1] - a[1])[0];

  const mostProductiveMonth = Object.entries(contributionsByMonth)
    .sort((a, b) => b[1] - a[1])[0];

  // Calculate contribution streak
  const days = contributionsCollection.contributionCalendar.weeks
    .flatMap(week => week.contributionDays)
    .reverse();

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  days.forEach((day, index) => {
    if (day.contributionCount > 0) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
      if (index === 0 || days[index - 1].contributionCount > 0) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  });

  // Get top repositories by stars
  const topRepos = repositories.nodes
    .filter(repo => repo.stargazerCount > 0)
    .slice(0, 5);

  return {
    totalContributions: contributionsCollection.contributionCalendar.totalContributions,
    totalCommits: contributionsCollection.totalCommitContributions,
    totalPRs: contributionsCollection.totalPullRequestContributions,
    totalIssues: contributionsCollection.totalIssueContributions,
    totalReviews: contributionsCollection.totalPullRequestReviewContributions,
    totalRepos: repositories.totalCount,
    topLanguages,
    mostProductiveDay,
    mostProductiveMonth,
    currentStreak,
    maxStreak,
    topRepos,
    followers: userData.followers.totalCount,
  };
};
