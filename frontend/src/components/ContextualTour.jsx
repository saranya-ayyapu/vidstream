import React from 'react';
import Joyride, { ACTIONS, STATUS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';

const ContextualTour = ({ onComplete }) => {
  const { user } = useAuth();

  const baseSteps = [
    {
      target: 'body',
      content: 'Welcome to VidStream! 👋 Let\'s take a quick tour. This will only take 2 minutes.',
      disableBeacon: true,
      placement: 'center',
      styles: {
        options: {
          width: 360,
        },
      },
    },
    {
      target: '[data-tour="library-tab"]',
      content: 'Your Video Library - View all your uploaded videos here. Only your videos are shown for privacy.',
      placement: 'right',
    },
    {
      target: '[data-tour="upload-tab"]',
      content: 'Upload Videos - Add new videos here. We automatically process and analyze them for safety.',
      placement: 'right',
    },
  ];

  // Add members step only for admins
  if (user?.role === 'Admin') {
    baseSteps.push({
      target: '[data-tour="members-tab"]',
      content: 'Team Management - Manage your team members and their roles from here.',
      placement: 'right',
    });
  }

  // Continue with remaining steps
  baseSteps.push(
    {
      target: '[data-tour="help-tab"]',
      content: 'Quick Tour - Launch this interactive tour anytime when you need help.',
      placement: 'right',
    },
    {
      target: '[data-tour="search-bar"]',
      content: 'Search Videos - Quickly find videos by typing their title.',
      placement: 'right',
    },
    {
      target: '[data-tour="filter-buttons"]',
      content: 'Filter by Status - View videos by: All, Completed, Flagged, or Processing.',
      placement: 'left',
    },
    {
      target: 'body',
      content: 'You\'re all set! 🎉 Upload videos or browse your library. Need help? Click "Quick Tour" anytime.',
      placement: 'center',
      styles: {
        options: {
          width: 360,
        },
      },
    }
  );

  const handleJoyrideCallback = (data) => {
    const { action, status } = data;

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE
    ) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={baseSteps}
      run={true}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      disableOverlayClose={false}
      scrollOffset={100}
      floaterProps={{
        disableAnimation: false,
        options: {
          preventOverflow: {
            padding: 20,
          },
        },
      }}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.45)',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          textColor: '#1e293b',
          width: 340,
          borderRadius: 12,
          zIndex: 10000,
        },
        beacon: {
          inner: 'rgba(37, 99, 235, 0.8)',
          outer: 'rgba(37, 99, 235, 0.25)',
        },
        spotlight: {
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 12,
          padding: '16px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          lineHeight: '1.5',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        floaterContainer: {
          filter: 'drop-shadow(0 10px 15px -3px rgba(0, 0, 0, 0.1))',
        },
        button: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginRight: '8px',
        },
        buttonBack: {
          backgroundColor: 'transparent',
          color: '#64748b',
          border: '1px solid #e2e8f0',
        },
      }}
      locale={{
        back: '← Back',
        close: 'Close',
        last: 'Done! 🎉',
        next: 'Next →',
        open: 'Start Tour',
        skip: 'Skip »',
      }}
    />
  );
};

export default ContextualTour;
