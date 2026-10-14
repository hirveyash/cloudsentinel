"use client";

import { useState, useEffect } from 'react';
import { SecurityEvent, Incident } from '../../src/lib/types/event';
import EventsTable from './events-table';
import EventDetailDrawer from './event-detail-drawer';
import IncidentsTable from './incidents-table';
import IncidentDetailDrawer from './incident-detail-drawer';

interface DashboardClientProps {
  events: SecurityEvent[];
  incidents: Incident[];
}

interface LocalIncidentStorage {
  incident_id: string;
  status?: string;
  analyst_notes?: string[];
}

const STORAGE_KEY = 'cloudsentinel_incidents_v1';

export default function DashboardClient({ events, incidents }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'incidents'>('incidents');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  
  const [incidentsState, setIncidentsState] = useState<Incident[]>(incidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const mergedIncidents = incidents.map((serverInc) => {
            const localInc = parsed.find(
              (p: LocalIncidentStorage) => p.incident_id === serverInc.incident_id
            );
            if (localInc) {
              return {
                ...serverInc,
                status: localInc.status || serverInc.status,
                analyst_notes: Array.isArray(localInc.analyst_notes) 
                  ? localInc.analyst_notes 
                  : serverInc.analyst_notes,
              };
            }
            return serverInc;
          });
          
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIncidentsState(mergedIncidents);
        }
      }
    } catch (error) {
      console.warn('Failed to load incident state from localStorage, using default.', error);
    } finally {
      setIsHydrated(true);
    }
  }, [incidents]);

  useEffect(() => {
    if (isHydrated) {
      try {
        const minimalState: LocalIncidentStorage[] = incidentsState.map((inc) => ({
          incident_id: inc.incident_id,
          status: inc.status,
          analyst_notes: inc.analyst_notes,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalState));
      } catch (error) {
        console.error('Failed to save incident state to localStorage', error);
      }
    }
  }, [incidentsState, isHydrated]);

  const handleUpdateIncident = (updatedIncident: Incident) => {
    setIncidentsState((prev) => 
      prev.map((inc) => 
        inc.incident_id === updatedIncident.incident_id ? updatedIncident : inc
      )
    );
    setSelectedIncident(updatedIncident);
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