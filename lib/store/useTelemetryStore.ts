import { create } from 'zustand';

export interface TelemetryState {
  // Telemetry variables
  temperature: number;
  pressure: number;
  sourceFill: number;
  productFill: number;
  valveOpen: boolean;
  transferActive: boolean;
  sourceDrainActive: boolean;
  productDrainActive: boolean;
  alarmState: boolean;
  deadheadWarning: boolean;
  dryRunWarning: boolean;
  simulationMode: 'manual' | 'automated';
  time: number;
  systemLogs: string[];

  // Sequential Batch Step System
  // 0: Empty Standby, 1: Fill Tank A (to 80%), 2: Transfer to B, 3: Drain B (Discharge)
  currentStep: number;
  
  // HMI Actions
  setSimulationMode: (mode: 'manual' | 'automated') => void;
  toggleValve: () => void;
  toggleTransfer: () => void;
  toggleSourceDrain: () => void;
  toggleProductDrain: () => void;
  topUpSource: () => void;
  triggerEmergencyStop: () => void;
  triggerVentValve: () => void;
  updateTelemetry: (key: 'temperature' | 'pressure' | 'sourceFill' | 'productFill', value: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSequence: () => void;
  tick: () => void;
  addLog: (message: string) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  temperature: 25.0,
  pressure: 14.7,
  sourceFill: 0,
  productFill: 0,
  valveOpen: false,
  transferActive: false,
  sourceDrainActive: false,
  productDrainActive: false,
  alarmState: false,
  deadheadWarning: false,
  dryRunWarning: false,
  simulationMode: 'automated',
  time: 0,
  systemLogs: ['SCADA System Initialized. Batch sequence loaded.'],
  currentStep: 0,

  setSimulationMode: (mode) => set((state) => {
    const logs = [...state.systemLogs, `System mode changed to ${mode.toUpperCase()}.`].slice(-25);
    return { simulationMode: mode, systemLogs: logs };
  }),

  toggleValve: () => set((state) => {
    const nextState = !state.valveOpen;
    const logs = [...state.systemLogs, `DSV Valve manual command: ${nextState ? 'OPEN' : 'CLOSE'}.`].slice(-25);
    return { valveOpen: nextState, systemLogs: logs };
  }),

  toggleTransfer: () => set((state) => {
    const nextState = !state.transferActive;
    if (nextState && state.sourceFill <= 0) {
      return { 
        systemLogs: [...state.systemLogs, '❌ Cannot start transfer pump: Source Vessel is empty.'].slice(-25) 
      };
    }
    const logs = [...state.systemLogs, `Transfer pump: ${nextState ? 'RUNNING' : 'STOPPED'}.`].slice(-25);
    return { 
      transferActive: nextState, 
      deadheadWarning: nextState && !state.valveOpen,
      dryRunWarning: false,
      systemLogs: logs 
    };
  }),

  toggleSourceDrain: () => set((state) => {
    const nextState = !state.sourceDrainActive;
    const logs = [...state.systemLogs, `Source Drain Valve: ${nextState ? 'OPEN' : 'CLOSE'}.`].slice(-25);
    return { sourceDrainActive: nextState, systemLogs: logs };
  }),

  toggleProductDrain: () => set((state) => {
    const nextState = !state.productDrainActive;
    const logs = [...state.systemLogs, `Product Drain Valve: ${nextState ? 'OPEN' : 'CLOSE'}.`].slice(-25);
    return { productDrainActive: nextState, systemLogs: logs };
  }),

  topUpSource: () => set((state) => {
    const nextFill = Math.min(100, state.sourceFill + 20);
    const logs = [...state.systemLogs, `Source top-up: added +20% fluid.`].slice(-25);
    return { sourceFill: nextFill, dryRunWarning: false, systemLogs: logs };
  }),

  triggerEmergencyStop: () => set((state) => {
    const logs = [...state.systemLogs, '⚠️ EMERGENCY STOP TRIGGERED! Stopping pump and closing valve.'].slice(-25);
    return {
      transferActive: false,
      sourceDrainActive: false,
      productDrainActive: false,
      valveOpen: false,
      alarmState: false,
      deadheadWarning: false,
      dryRunWarning: false,
      simulationMode: 'manual',
      systemLogs: logs,
    };
  }),

  triggerVentValve: () => set((state) => {
    const logs = [...state.systemLogs, '💨 Safety Vent Valve opened. Venting pressure.'].slice(-25);
    return {
      pressure: 14.7,
      alarmState: false,
      systemLogs: logs,
    };
  }),

  updateTelemetry: (key, value) => set((state) => {
    const nextState = { [key]: value } as any;
    if (key === 'pressure') {
      nextState.alarmState = value > 60.0;
    }
    return nextState;
  }),

  nextStep: () => set((state) => {
    const nextVal = (state.currentStep + 1) % 4;
    const stepNames = ['STANDBY / EMPTY', 'FILLING SOURCE TANK A', 'TRANSFERRING FLUID (A to B)', 'DISCHARGING STORAGE TANK B'];
    const logs = [...state.systemLogs, `Phase advanced to Step ${nextVal + 1}: ${stepNames[nextVal]}.`].slice(-25);
    
    // In automated mode, set up the initial equipment states for the step
    const updates: Partial<TelemetryState> = { currentStep: nextVal, systemLogs: logs };
    if (state.simulationMode === 'automated') {
      if (nextVal === 0) {
        updates.transferActive = false;
        updates.sourceDrainActive = false;
        updates.productDrainActive = false;
        updates.valveOpen = false;
      } else if (nextVal === 1) {
        updates.transferActive = false;
        updates.sourceDrainActive = false;
        updates.productDrainActive = false;
        updates.valveOpen = false;
      } else if (nextVal === 2) {
        updates.valveOpen = true;
        updates.transferActive = state.sourceFill > 0;
        updates.sourceDrainActive = false;
        updates.productDrainActive = false;
      } else if (nextVal === 3) {
        updates.transferActive = false;
        updates.sourceDrainActive = false;
        updates.productDrainActive = true;
        updates.valveOpen = false;
      }
    }

    return updates;
  }),

  prevStep: () => set((state) => {
    const prevVal = (state.currentStep - 1 + 4) % 4;
    const stepNames = ['STANDBY / EMPTY', 'FILLING SOURCE TANK A', 'TRANSFERRING FLUID (A to B)', 'DISCHARGING STORAGE TANK B'];
    const logs = [...state.systemLogs, `Phase reverted to Step ${prevVal + 1}: ${stepNames[prevVal]}.`].slice(-25);
    
    const updates: Partial<TelemetryState> = { currentStep: prevVal, systemLogs: logs };
    if (state.simulationMode === 'automated') {
      if (prevVal === 0) {
        updates.transferActive = false;
        updates.sourceDrainActive = false;
        updates.productDrainActive = false;
        updates.valveOpen = false;
      } else if (prevVal === 1) {
        updates.transferActive = false;
        updates.sourceDrainActive = false;
        updates.productDrainActive = false;
        updates.valveOpen = false;
      } else if (prevVal === 2) {
        updates.valveOpen = true;
        updates.transferActive = state.sourceFill > 0;
        updates.sourceDrainActive = false;
        updates.productDrainActive = false;
      } else if (prevVal === 3) {
        updates.transferActive = false;
        updates.sourceDrainActive = false;
        updates.productDrainActive = true;
        updates.valveOpen = false;
      }
    }

    return updates;
  }),

  resetSequence: () => set((state) => {
    const logs = [...state.systemLogs, '🔄 Batch sequence reset to standby empty state.'].slice(-25);
    return {
      currentStep: 0,
      sourceFill: 0,
      productFill: 0,
      transferActive: false,
      sourceDrainActive: false,
      productDrainActive: false,
      valveOpen: false,
      alarmState: false,
      deadheadWarning: false,
      dryRunWarning: false,
      temperature: 25.0,
      pressure: 14.7,
      systemLogs: logs,
    };
  }),

  addLog: (message) => set((state) => ({
    systemLogs: [...state.systemLogs, message].slice(-25),
  })),

  tick: () => set((state) => {
    const logs = [...state.systemLogs];
    let nextSourceFill = state.sourceFill;
    let nextProductFill = state.productFill;
    let nextPressure = state.pressure;
    let nextTemp = state.temperature;
    let nextTransferActive = state.transferActive;
    let nextDeadheadWarning = state.deadheadWarning;
    let nextDryRunWarning = state.dryRunWarning;
    let nextValveOpen = state.valveOpen;
    let nextSourceDrain = state.sourceDrainActive;
    let nextProductDrain = state.productDrainActive;

    const nextTime = state.time + 0.1;

    // Automated loop sequence overrides
    if (state.simulationMode === 'automated') {
      if (state.currentStep === 0) {
        nextTransferActive = false;
        nextSourceDrain = false;
        nextProductDrain = false;
        nextValveOpen = false;
      } else if (state.currentStep === 1) {
        // Automatically fill source to 80%
        nextTransferActive = false;
        nextSourceDrain = false;
        nextProductDrain = false;
        nextValveOpen = false;
        if (nextSourceFill < 80) {
          nextSourceFill = Math.min(80, nextSourceFill + 4);
          if (nextSourceFill === 80) {
            logs.push('✅ Step 2 Complete: Source Vessel filled to 80%. Progress to Transfer Phase.');
          }
        }
      } else if (state.currentStep === 2) {
        // Automatically run pump and valve
        nextSourceDrain = false;
        nextProductDrain = false;
        // Keep the valve open automatically unless deadheading is deliberately forced by closing it manually
        // We let the tick run standard transfer
      } else if (state.currentStep === 3) {
        // Automatically drain Tank B
        nextTransferActive = false;
        nextSourceDrain = false;
        nextProductDrain = true;
        nextValveOpen = false;
      }
    }

    // 1. Drains
    if (nextSourceDrain) {
      nextSourceFill = Math.max(0, nextSourceFill - 4);
    }
    if (nextProductDrain) {
      nextProductFill = Math.max(0, nextProductFill - 4);
      if (nextProductFill === 0 && state.currentStep === 3 && state.simulationMode === 'automated') {
        logs.push('✅ Step 4 Complete: Product Vessel empty. Click Reset or back to Step 1.');
      }
    }

    // 2. Transfer logic
    if (nextTransferActive) {
      if (nextValveOpen) {
        nextDeadheadWarning = false;
        
        // Check dry run condition
        if (nextSourceFill <= 0) {
          nextDryRunWarning = true;
          nextTransferActive = false;
          logs.push('🚨 ALARM: Pump shutdown! Dry-running protection interlock triggered.');
        } else {
          nextDryRunWarning = false;
          
          // Normal transfer
          const transferAmount = Math.min(3, nextSourceFill);
          nextSourceFill -= transferAmount;
          nextProductFill = Math.min(100, nextProductFill + transferAmount);

          // Relieve pressure automatically when flowing
          if (nextPressure > 40.0) {
            nextPressure = parseFloat(Math.max(40.0, nextPressure - 6.0).toFixed(1));
          }

          // Automated mode dynamic telemetry
          if (state.simulationMode === 'automated') {
            nextPressure = parseFloat(Math.max(14.7, 35.0 + Math.sin(nextTime) * 1.5 + (Math.random() - 0.5) * 0.4).toFixed(1));
            nextTemp = parseFloat((180.0 + Math.sin(nextTime * 1.2) * 2 + (Math.random() - 0.5)).toFixed(1));
          }

          // Auto stop check
          if (nextSourceFill <= 0) {
            nextTransferActive = false;
            logs.push('ℹ_ Transfer complete: Source Vessel is empty.');
          } else if (nextProductFill >= 100) {
            nextTransferActive = false;
            logs.push('ℹ_ Transfer stopped: Product Storage Tank is full.');
          }
        }
      } else {
        // DEAD-HEAD! Pump active but valve closed!
        nextDeadheadWarning = true;
        nextDryRunWarning = false;

        // Pressure rises rapidly in both modes
        nextPressure = parseFloat((state.pressure + 5.0 + (Math.random() - 0.5) * 0.5).toFixed(1));
        nextTemp = parseFloat((state.temperature + 1.5 + (Math.random() - 0.5) * 0.2).toFixed(1));
        
        if (state.time % 1 < 0.2) {
          logs.push('⚠️ WARNING: Pump running against CLOSED DSV Valve! Pressure rising!');
        }

        // Auto shutdown if pressure becomes critical to prevent explosion
        if (nextPressure > 80.0) {
          nextTransferActive = false;
          nextDeadheadWarning = false;
          logs.push('🚨 ALARM: Emergency Pump Shutdown! Critical pressure deadhead interlock triggered.');
        }
      }
    } else {
      nextDeadheadWarning = false;
      nextDryRunWarning = false;

      // Pump idle: decay temp/pressure to baseline in auto, or do nothing in manual (let user control sliders)
      if (state.simulationMode === 'automated') {
        const targetStandbyPressure = 14.7;
        const targetStandbyTemp = 25.0; // Decay to room temperature when idle in batch mode

        if (state.pressure > targetStandbyPressure) {
          nextPressure = parseFloat(Math.max(targetStandbyPressure, state.pressure - 2.5).toFixed(1));
        } else {
          nextPressure = parseFloat(Math.max(targetStandbyPressure, state.pressure + (Math.random() - 0.5) * 0.2).toFixed(1));
        }

        if (state.temperature > targetStandbyTemp) {
          nextTemp = parseFloat(Math.max(targetStandbyTemp, state.temperature - 3.0).toFixed(1));
        } else if (state.temperature < targetStandbyTemp) {
          nextTemp = parseFloat(Math.min(targetStandbyTemp, state.temperature + 1.0).toFixed(1));
        }
      }
    }

    // Alarm State calculation
    const nextAlarm = nextPressure > 60.0;
    if (nextAlarm && !state.alarmState) {
      logs.push('🚨 ALARM: Line pressure exceeded critical threshold (>60 PSI)!');
    }

    return {
      time: nextTime,
      sourceFill: parseFloat(nextSourceFill.toFixed(1)),
      productFill: parseFloat(nextProductFill.toFixed(1)),
      pressure: nextPressure,
      temperature: nextTemp,
      transferActive: nextTransferActive,
      sourceDrainActive: nextSourceDrain,
      productDrainActive: nextProductDrain,
      valveOpen: nextValveOpen,
      deadheadWarning: nextDeadheadWarning,
      dryRunWarning: nextDryRunWarning,
      alarmState: nextAlarm,
      systemLogs: logs.slice(-25),
    };
  }),
}));
