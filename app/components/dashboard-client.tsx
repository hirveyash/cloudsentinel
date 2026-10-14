"use client";

import { useState } from 'react';
import { SecurityEvent, Incident } from '../../src/lib/types/event';
import EventsTable from './events-table';
import EventDetailDrawer from './event-detail-drawer';
import IncidentsTable from './incidents-table';
import IncidentDetailDrawer from './incident-detail-drawer';

interface DashboardClientProps {
  events: SecurityEvent[];
  incidents: Incident[];
}

export default function DashboardClient({ events, incidents }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'incidents'>('incidents');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  
  // Manage incidents in state so updates persist during the session
  const [incidentsState, setIncidentsState] = useState<Incident[]>(incidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Function to update an incident in the state
  const handleUpdateIncident = (updatedIncident: Incident) => {
    setIncidentsState((prev) => 
      prev.map((inc) => 
        inc.incident_id === updatedIncident.incident_id ? updatedIncident : inc
      )
    );
    setSelectedIncident(updatedIncident); // Update the drawer view as well
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'events' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Security Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'incidents' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Incidents ({incidentsState.length})
        </button>
      </div>

      {activeTab === 'events' ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Security Events</h2>
          <EventsTable events={events} onSelectEvent={setSelectedEvent} />
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Incidents</h2>
          <IncidentsTable incidents={incidentsState} onSelectIncident={setSelectedIncident} />
        </div>
      )}

      <EventDetailDrawer event={selectedEvent} allEvents={events} onClose={() => setSelectedEvent(null)} />
      <IncidentDetailDrawer 
        incident={selectedIncident} 
        onUpdateIncident={handleUpdateIncident}
        onClose={() => setSelectedIncident(null)} 
      />
    </div>
  );
}