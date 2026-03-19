import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './App.css';

function App() {
  const parentRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const fetchFHIRData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('https://hapi.fhir.org/baseR4/Patient?_count=100');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        
        const parsedRecords = (data.entry || []).map(entry => {
          const resource = entry.resource || {};
          const isActive = Math.random() > 0.3; 

          return {
            id: resource.id || 'Unknown',
            familyName: resource.name?.[0]?.family || 'Unknown',
            birthDate: resource.birthDate || 'Unknown',
            status: isActive ? 'Active' : 'Discharged'
          };
        });

       
        const scaledRecords = [];
        const requiredRecords = 5000;

        if (parsedRecords.length > 0) {
          while (scaledRecords.length < requiredRecords) {
            parsedRecords.forEach((record) => {
              if (scaledRecords.length < requiredRecords) {
                scaledRecords.push({
                  ...record,
                  
                  id: `${record.id}-${scaledRecords.length}`
                });
              }
            });
          }
        }

        setPatients(scaledRecords);
        setLoading(false);
      } catch (err) {
        setError('Failed to load FHIR data: ' + err.message);
        setLoading(false);
      }
    };

    fetchFHIRData();
  }, []);

  
  const rowVirtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, 
  });

  return (
    <div className="page-wrapper" style={{
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '4vh 4vw',
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>

      {}
      <div style={{
        width: '100%',
        height: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>

        {}
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a', fontWeight: '600', letterSpacing: '-0.02em' }}>
            FHIR Tabular Viewer
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
            Total Records Rendered: {loading ? '...' : patients.length.toLocaleString()}
          </p>
        </header>

        {}
        <div style={{
          flex: 1,
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr',
            backgroundColor: '#f1f5f9',
            fontWeight: '600',
            borderBottom: '1px solid #cbd5e1',
            padding: '0 24px',
            height: '44px',
            alignItems: 'center',
            color: '#475569',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <div>Patient ID</div>
            <div>Family Name</div>
            <div>Birth Date</div>
            <div>Status</div>
          </div>

          {}
          <div
            ref={parentRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              position: 'relative',
              backgroundColor: '#fff'
            }}
          >
            {}
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
                Loading FHIR data...
              </div>
            ) : error ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444', fontSize: '14px' }}>
                {error}
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const patient = patients[virtualRow.index];
                  const isActive = patient.status === 'Active';

                  return (
                    <div
                      key={virtualRow.index}
                      className="table-row-hover"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr',
                        alignItems: 'center',
                        padding: '0 24px',
                        borderBottom: '1px solid #f1f5f9',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        color: '#334155',
                        backgroundColor: '#ffffff',
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#0f172a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                        {patient.id}
                      </div>
                      <div style={{ fontWeight: '500' }}>{patient.familyName}</div>
                      <div style={{ color: '#64748b' }}>{patient.birthDate}</div>

                      {}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#10b981' : '#94a3b8',
                          boxShadow: isActive ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
                        }}></span>
                        <span style={{
                          color: isActive ? '#059669' : '#64748b',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
