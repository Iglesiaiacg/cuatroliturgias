import React from 'react';
import LiturgicalVestmentCard from './LiturgicalVestmentCard';
import MinistersOnDutyCard from './MinistersOnDutyCard';
import UpcomingEventsCard from './UpcomingEventsCard';
import PendingCertificatesCard from './PendingCertificatesCard';
import StatsCard from './StatsCard';
import NoticesCard from './NoticesCard';
import IntentionsCard from './IntentionsCard';

export default function CelebrantDashboard({ date, setShowAdminDashboard }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {/* COL 1: Liturgical Essentials */}
            <div className="space-y-6 animate-fade-in">
                {/* Rubrics & Color - Always Top Priority */}
                <LiturgicalVestmentCard date={date || new Date()} />

                {/* Intentions - Who are we praying for? */}
                <IntentionsCard date={date} />
            </div>

            {/* COL 2: People & Ministers */}
            <div className="space-y-6 animate-fade-in">
                {/* Who is serving? (Read Only) */}
                <MinistersOnDutyCard date={date || new Date()} />

                {/* Announcements to make */}
                <UpcomingEventsCard />
            </div>

            {/* COL 3: Supervision & Notices */}
            <div className="space-y-6 animate-fade-in">
                {/* Pending Paperwork (Supervisory) */}
                <PendingCertificatesCard />

                {/* Attendance Count (Read Only) */}
                <StatsCard readOnly={true} />

                {/* General Notices Card (e.g. from Bishop) */}
                <NoticesCard />

                {/* Quick link to full dashboard */}
                <div className="text-center pt-4 opacity-50 hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setShowAdminDashboard(true)}
                        className="text-xs text-gray-500 font-bold underline"
                    >
                        Necesito herramientas administrativas...
                    </button>
                </div>
            </div>
        </div>
    );
}
