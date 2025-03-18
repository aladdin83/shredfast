import { createClient } from '@supabase/supabase-js';
import moment from 'moment';

// const memberStackToken = {
//   id: "mem_sb_cm8buq9vk0pyi0wr13u1kests",
//   verified: false,
//   createdAt: "2025-03-16T16:30:11.074Z",
//   profileImage: null,
//   lastLogin: "2025-03-17T20:28:04.449Z",
//   auth: { email: "aladdin83+1@gmail.com", hasPassword: true, providers: [] },
//   metaData: {},
//   customFields: { "first-name": "aladdin" },
//   permissions: [],
//   stripeCustomerId: "cus_RxEYTBVSjDmtD6",
//   loginRedirect: "/getting-started",
//   teams: { belongsToTeam: false, ownedTeams: [], joinedTeams: [] },
//   planConnections: [
//     {
//       id: "con_sb_cm8bur9mx0pyv0wr1dsdqg5et",
//       active: false,
//       status: "TRIALING",
//       planId: "pln_1-month-membership-free-trial--w8en0pmj",
//       type: "SUBSCRIPTION",
//       payment: {
//         priceId: "prc_1-month-membership-cceo0pcp",
//         amount: 45,
//         currency: "usd",
//         status: "PAID",
//         lastBillingDate: null,
//         nextBillingDate: 1742747448,
//         cancelAtDate: null,
//       },
//     },
//   ],
//   _comments: { isModerator: false },
// };

// localStorage.setItem("_ms-mem", JSON.stringify(memberStackToken));

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

const INTERVAL_DURATION = 5;
let trackerInterval: ReturnType<typeof setInterval> | null = null;

window.addEventListener('load', () => {
  initializeSession();
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach((videoElement) => {
    videoElement.addEventListener('play', () => {
      if(trackerInterval) {
        clearInterval(trackerInterval);
      }
      trackerInterval = setInterval(async () => {
        const res = await supabase.from('session_activity').insert({
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
        console.log(res);
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
