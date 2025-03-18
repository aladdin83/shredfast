import { createClient } from '@supabase/supabase-js';
import moment from 'moment';

const SUPABASE_URL = "https://qlkogybsvapxmztzzpkj.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsa29neWJzdmFweG16dHp6cGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzkwNzAsImV4cCI6MjA1NzcxNTA3MH0.KAgmCEPVA4fI2aBpH9KKqh8yAILECI8A9pdiBDe8Brc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const getMemberStackToken = () => {
  const memberStackToken = localStorage.getItem('_ms-mem');
  if (!memberStackToken) {
    return null;
  }
  return JSON.parse(memberStackToken);
}

const initializeSession = async () => {
  if(!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', generateSessionId(32));
  }
  const sessionId = sessionStorage.getItem('sessionId');
  const { id: memberId } = getMemberStackToken();
  const { error } = await supabase
    .rpc("get_or_create_session", { session_id: sessionId, input_member_id: memberId });
  if (error) {
    console.error('error', error);
  }
}

const generateSessionId = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const updateProfile = async () => {
  const res = await supabase.rpc('aggregate_user_activity', { memberid: getMemberStackToken().id });
  if (res.error) return;
  const totalHoursEl = document.querySelector("#totalHours");
  const last7DaysHoursEl = document.querySelector("#last7DaysHours");
  const last30DaysHoursEl = document.querySelector("#last30DaysHours");
  res.data.forEach((data: any) => {
    switch (data.period) {
      case "total":
        if (totalHoursEl)
        totalHoursEl.textContent = `${Math.round(data.total_duration / 3600 * 10) / 10}`;
        break;
      case "last_7_days":
        if (last7DaysHoursEl)
        last7DaysHoursEl.textContent = `${
          Math.round((data.total_duration / 3600) * 10) / 10
        }`;
        break;
      case "last_month":
        if (last30DaysHoursEl)
        last30DaysHoursEl.textContent = `${
          Math.round((data.total_duration / 3600) * 10) / 10
        }`;
        break;
    }
  });


}

const INTERVAL_DURATION = 5 * 60;
let trackerInterval: ReturnType<typeof setInterval> | null = null;

window.addEventListener('load', () => {
  initializeSession();
  const totalHoursEl = document.querySelector("#totalHours");
  if (totalHoursEl) {
    updateProfile();
  }
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach((videoElement) => {
    videoElement.addEventListener('play', () => {
      if(trackerInterval) {
        clearInterval(trackerInterval);
      }
      trackerInterval = setInterval(async () => {
        await supabase.from('session_activity').insert({
          session_id: sessionStorage.getItem('sessionId'),
          member_id: getMemberStackToken().id,
          video_url: videoElement.src,
          duration: INTERVAL_DURATION,
          start_time: moment().subtract(INTERVAL_DURATION, 'seconds').toISOString(),
          end_time: moment().toISOString(),
          year: moment().year(),
          month: moment().month(),
          day: moment().date(),
        });
      }
      , INTERVAL_DURATION * 1000);
    });
    videoElement.addEventListener('pause', () => {
      if(trackerInterval) {
        clearInterval(trackerInterval);
      }
    });
  });
});
