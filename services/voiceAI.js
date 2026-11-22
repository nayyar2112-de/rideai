// services/voiceAI.js
// Voice intent parser + TTS using expo-speech
import * as Speech from 'expo-speech';

/**
 * Parse a spoken command into a structured intent object.
 * In production, replace with a real STT + LLM call.
 */
export function parseIntent(text) {
  const lower = text.toLowerCase();

  if (lower.includes('airport') || lower.includes('terminal')) {
    return { intent: 'SET_DESTINATION', destination: 'International Airport Terminal 2' };
  }
  if (lower.includes('mall') || lower.includes('shopping')) {
    return { intent: 'SET_DESTINATION', destination: 'Central Mall, MG Road' };
  }
  if (lower.includes('hospital')) {
    return { intent: 'SET_DESTINATION', destination: 'City Hospital, Park Street' };
  }
  if (lower.includes('tech park') || lower.includes('office')) {
    return { intent: 'SET_DESTINATION', destination: 'Tech Park, Electronic City' };
  }
  if (lower.includes('station') || lower.includes('railway')) {
    return { intent: 'SET_DESTINATION', destination: 'Railway Station, Platform 1' };
  }
  if (lower.includes('suv') || lower.includes('bag') || lower.includes('luggage')) {
    return { intent: 'SELECT_VEHICLE', vehicleId: 3 };
  }
  if (lower.includes('comfort') || lower.includes('premium')) {
    return { intent: 'SELECT_VEHICLE', vehicleId: 2 };
  }
  if (lower.includes('cheap') || lower.includes('economy') || lower.includes('ridego')) {
    return { intent: 'SELECT_VEHICLE', vehicleId: 1 };
  }
  if (lower.includes('cancel')) {
    return { intent: 'CANCEL_RIDE' };
  }
  if (lower.includes('eta') || lower.includes('how long') || lower.includes('when')) {
    return { intent: 'ASK_ETA' };
  }
  if (lower.includes('book') || lower.includes('ride') || lower.includes('go to')) {
    return { intent: 'BOOK_RIDE' };
  }

  return { intent: 'UNKNOWN', raw: text };
}

/**
 * Speak a response string using device TTS.
 */
export function speak(text, options = {}) {
  Speech.speak(text, {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.95,
    ...options,
  });
}

export function stopSpeaking() {
  Speech.stop();
}

/**
 * Pre-built AI response phrases.
 */
export const AI_RESPONSES = {
  greeting: "Welcome to Ride AI. Where would you like to go today?",
  destinationSet: (dest) => `Great! I've set your destination to ${dest}. Looking for available rides.`,
  vehicleSelected: (name, price, eta) => `${name} selected. Estimated fare is ${price}. Driver arrives in ${eta}.`,
  matchingDriver: "Perfect. I'm now matching you with the best driver in your area.",
  driverFound: (name, rating, arrivalMin) =>
    `Found your driver! ${name}, rated ${rating} stars, will arrive in ${arrivalMin} minutes.`,
  rideConfirmed: "Your ride is confirmed. I'll notify you when your driver is nearby.",
  cancelled: "Your ride has been cancelled. No charges applied.",
  askEta: (mins) => `Your driver is ${mins} minutes away.`,
  unknown: "I didn't catch that. Try saying: book a ride to the airport, or I need an SUV.",
};
