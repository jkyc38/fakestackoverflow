export function calculateDate (dateString) {
    const currentDate = new Date();
    const questionDate = new Date(dateString);
    const timeDifferenceInSeconds = Math.floor((currentDate - questionDate) / 1000);
    // Time difference less than a day
    if (timeDifferenceInSeconds < 24 * 60 * 60 && timeDifferenceInSeconds >= 0) {
      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      const hours = Math.floor(timeDifferenceInSeconds / 3600);
      if (minutes === 0) {
        // Posted less than 1 minute ago
        return timeDifferenceInSeconds === 0
          ? ' just now'
          : timeDifferenceInSeconds === 1
            ? ` ${timeDifferenceInSeconds} second ago`
            : ` ${timeDifferenceInSeconds} seconds ago`;
      } if (hours === 0) {
        return minutes === 1 ? ` ${minutes} minute ago` : ` ${minutes} minutes ago`;
      }
      return hours === 1 ? ` ${hours} hour ago` : ` ${hours} hours ago`;
    } if (timeDifferenceInSeconds < 24 * 60 * 60 * 365 && timeDifferenceInSeconds >= 0) {
      // Posted over a day
      return (
        `${questionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } at ${
          questionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      );
    }
    // Posted over a year ago
    return (
      `${questionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      } at ${
        questionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    );
  }
  