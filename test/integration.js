// run with babel-node
import { go, chan, take, put } from "../vendor/js-csp";
import StateTrooper from '../lib/state_trooper';

const serverReportReadChan = chan();
const bioReadChan = chan();
const bioWriteChan = chan();
const activityReadChan = chan();

// usage
go(function*() {
  const ch = StateTrooper.patrol({
    state: {
      serverReport: null,
      bio: null,
      activity: null
    },

    chans: {
      'serverReport': { read: serverReportReadChan },
      'bio': { read: bioReadChan, write: bioWriteChan },
      'activity': { read: activityReadChan }
    }
  });

  // simulate ajax
  setTimeout(() => {
    go(function* () {
      yield put(serverReportReadChan, 'omg awesome');
    });
  }, 1000);
  setTimeout(() => {
    go(function* () {
      yield put(activityReadChan, 'yay its active');
    });
  }, 2000);

  let cur, c, x;
  while(cur = yield take(ch)) {
    console.log(cur.deref());

    // simulate component modifying state
    c = cur.refine('bio');

    if (c.deref() === null) {
      c.replace({ foo: 'bar' });
    }
    else if (c.deref().foo === 'bar') {
      x = c.refine('foo');
      x.replace('baz');
    }
  }
});
