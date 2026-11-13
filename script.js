// ---------- Small helpers ----------
const $ = id => document.getElementById(id);

function getValue(id) {
  return $(id).value.trim();
}

function getRadio(name) {
  const checked = document.querySelector('input[name="' + name + '"]:checked');
  return checked ? checked.value : '';
}

function getLabs() {
  const boxes = document.querySelectorAll('input[name="labs"]:checked');
  return Array.from(boxes).map(box => box.value);
}

// Age in whole years from a "YYYY-MM-DD" date
function getAge(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;

  const birthdayNotYet =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);

  if (birthdayNotYet) age--;
  return age;
}

// Returns an error message if the phone is wrong, or '' if it is fine
function checkPhone(id) {
  const phone = getValue(id);
  if (phone === '') return 'Enter an 11-digit mobile number.';
  if (!/^[0-9]{11}$/.test(phone)) return 'Use exactly 11 digits, numbers only.';
  if (!phone.startsWith('09')) return 'Mobile numbers start with 09.';
  return '';
}

function checkName(name) {
  const words = name.trim().split(/\s+/);
  if (name === '') return 'Enter a name.';
  if (!/^[A-Za-zÀ-ÿ.'’ -]+$/.test(name)) return 'Use letters only.';
  if (words.length < 2) return 'Include a first and last name.';
  return '';
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FILE_MB = 2;
const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf'];

// Date of birth can't be in the future
$('dob').max = new Date().toISOString().split('T')[0];

// ---------- Validation rules (one function per field) ----------
// Each rule returns an error message, or '' when the field is valid.
const rules = {
  name() {
    return checkName(getValue('name'));
  },

  lrn() {
    const lrn = getValue('lrn');
    if (lrn === '') return 'Enter your LRN.';
    if (!/^[0-9]{12}$/.test(lrn)) return 'The LRN must be exactly 12 digits.';
    return '';
  },

  dob() {
    const dob = $('dob').value;
    if (dob === '') return 'Select your date of birth.';
    if (new Date(dob) > new Date()) return 'Date of birth can’t be in the future.';
    if (getAge(dob) < 16) return 'You must be at least 16 years old to enroll.';
    return '';
  },

  mobile() {
    return checkPhone('mobile');
  },

  email() {
    const email = getValue('email');
    if (email === '') return 'Enter your institutional email.';
    if (!emailPattern.test(email)) return 'That is not a valid email address.';
    if (!/\.edu(\.ph)?$/i.test(email)) return 'Use your school email, ending in .edu or .edu.ph.';
    return '';
  },

  pemail() {
    const email = getValue('pemail');
    if (email === '') return 'Enter your personal email.';
    if (!emailPattern.test(email)) return 'That is not a valid email address.';
    if (email.toLowerCase() === getValue('email').toLowerCase()) {
      return 'Personal and institutional emails must be different.';
    }
    return '';
  },

  program() {
    return $('program').value === '' ? 'Choose your degree program.' : '';
  },

  year() {
    return getRadio('year') === '' ? 'Select your year level.' : '';
  },

  status() {
    return getRadio('status') === '' ? 'Select your enrollment status.' : '';
  },

  units() {
    const text = $('units').value;
    const units = Number(text);
    if (text === '') return 'Enter the units you will take.';
    if (!Number.isInteger(units)) return 'Units must be a whole number.';
    if (units < 3 || units > 24) return 'Units must be between 3 and 24.';
    if (getRadio('status') === 'Regular' && units < 15) {
      return 'Regular students must take at least 15 units.';
    }
    return '';
  },

  gwa() {
    const text = $('gwa').value;
    const gwa = Number(text);
    if (text === '') return 'Enter your GPA / GWA.';
    if (gwa < 1 || gwa > 5) return 'GWA must be between 1.00 and 5.00.';
    if (!/^\d(\.\d{1,2})?$/.test(text)) return 'Use at most two decimal places.';
    return '';
  },

  labs() {
    return getLabs().length === 0 ? 'Select at least one laboratory option.' : '';
  },

  ecname() {
    const error = checkName(getValue('ecname'));
    if (error) return error;
    if (getValue('ecname').toLowerCase() === getValue('name').toLowerCase()) {
      return 'Your emergency contact must be someone else.';
    }
    return '';
  },

  ecphone() {
    const error = checkPhone('ecphone');
    if (error) return error;
    if (getValue('ecphone') === getValue('mobile')) {
      return 'Use a different number from your own.';
    }
    return '';
  },

  pw() {
    const password = $('pw').value;
    if (password === '') return 'Create a password.';
    if (password.length < 8) return 'Use at least 8 characters.';
    if (!/[a-z]/.test(password)) return 'Add a lowercase letter.';
    if (!/[A-Z]/.test(password)) return 'Add an uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Add a number.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Add a symbol, like ! or @.';
    return '';
  },

  pw2() {
    if ($('pw2').value === '') return 'Re-enter your password.';
    if ($('pw2').value !== $('pw').value) return 'Passwords do not match.';
    return '';
  },

  file() {
    const file = $('file').files[0];
    if (!file) return 'Upload your photo or proof of grades.';

    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) return 'Only PNG, JPG, or PDF files are allowed.';
    if (!allowedTypes.includes(file.type)) return 'The file type does not match its extension.';
    if (file.size === 0) return 'This file is empty.';
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      return 'File is too big. The limit is ' + MAX_FILE_MB + ' MB.';
    }
    return '';
  },

  essay() {
    const text = getValue('essay');
    if (text.length < 30) return 'Write at least 30 characters.';
    if (text.length > 500) return 'Keep it to 500 characters or fewer.';
    return '';
  },

  terms() {
    return $('terms').checked ? '' : 'You must accept the terms and honor code.';
  }
};

const fieldNames = Object.keys(rules);
const touched = new Set(); // fields the user has already visited

// ---------- Showing errors ----------
function checkField(name) {
  const message = rules[name]();
  const box = document.querySelector('[data-f="' + name + '"]');

  box.classList.toggle('bad', message !== '');
  box.classList.toggle('good', message === '');
  box.querySelector('.err').textContent = message;

  return message === '';
}

function updateProgress() {
  const validCount = fieldNames.filter(name => rules[name]() === '').length;
  $('ptxt').textContent = validCount + ' of ' + fieldNames.length + ' fields valid';
  $('pbar').style.width = (validCount / fieldNames.length) * 100 + '%';
}

// Re-check every field the user has touched, then update the progress bar
function refresh() {
  touched.forEach(checkField);
  updateProgress();
}

// ---------- Events ----------
// Mark a field as touched when the user leaves it or changes it
document.querySelectorAll('[data-f]').forEach(box => {
  const name = box.dataset.f;
  box.addEventListener('focusout', () => {
    touched.add(name);
    refresh();
  });
});

$('f').addEventListener('input', refresh);

$('f').addEventListener('change', event => {
  const box = event.target.closest('[data-f]');
  if (box) touched.add(box.dataset.f);
  refresh();
});

// Only allow digits in number-like text boxes
['lrn', 'mobile', 'ecphone'].forEach(id => {
  $(id).addEventListener('input', () => {
    $(id).value = $(id).value.replace(/\D/g, '');
  });
});

// Show age under the date of birth
$('dob').addEventListener('input', () => {
  const badge = $('age');
  const dob = $('dob').value;
  badge.className = 'badge';

  if (dob === '' || new Date(dob) > new Date()) {
    badge.textContent = 'Age appears here';
    return;
  }

  const age = getAge(dob);
  if (age >= 16) {
    badge.textContent = 'Age: ' + age + ', eligible for college';
    badge.classList.add('ok');
  } else {
    badge.textContent = 'Age: ' + age + ', below the minimum age of 16';
    badge.classList.add('no');
  }
});

// "No laboratory course" can't be combined with other lab courses
$('labs').addEventListener('change', event => {
  const clicked = event.target;
  if (!clicked.checked) return;

  if (clicked === $('labnone')) {
    document.querySelectorAll('input[name="labs"]').forEach(box => {
      if (box !== clicked) box.checked = false;
    });
  } else {
    $('labnone').checked = false;
  }
});

// Password strength bar (one point for each rule met)
$('pw').addEventListener('input', () => {
  const password = $('pw').value;
  const points = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;

  const meter = $('meter');
  meter.style.width = (points / 5) * 100 + '%';
  meter.style.background =
    points < 3 ? 'var(--bad)' : points < 5 ? 'var(--gold)' : 'var(--ok)';
});

// Character counter for the statement
$('essay').addEventListener('input', () => {
  $('count').textContent = getValue('essay').length + ' / 500 characters (minimum 30)';
});

// File name and image preview
$('file').addEventListener('change', () => {
  const file = $('file').files[0];
  const preview = $('prev');
  preview.style.display = 'none';

  if (!file) {
    $('finfo').textContent = 'PNG, JPG, or PDF, up to 2 MB.';
    return;
  }

  $('finfo').textContent = file.name + ' (' + Math.round(file.size / 1024) + ' KB)';

  if (file.type.startsWith('image/')) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  }
});

// ---------- Submit ----------
$('f').addEventListener('submit', event => {
  event.preventDefault();

  // Check every field; collect the ones with errors
  const invalid = fieldNames.filter(name => {
    touched.add(name);
    return !checkField(name);
  });
  updateProgress();

  if (invalid.length > 0) {
    $('banner').textContent = invalid.length + ' field(s) need your attention.';
    const firstBox = document.querySelector('[data-f="' + invalid[0] + '"]');
    firstBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
    firstBox.querySelector('input, select, textarea').focus({ preventScroll: true });
    return;
  }

  $('banner').textContent = '';
  showSummary();
});

function showSummary() {
  const file = $('file').files[0];

  const rows = [
    ['Full name', getValue('name')],
    ['Student ID / LRN', getValue('lrn')],
    ['Date of birth', $('dob').value + ' (age ' + getAge($('dob').value) + ')'],
    ['Mobile', getValue('mobile')],
    ['Institutional email', getValue('email')],
    ['Personal email', getValue('pemail')],
    ['Program', $('program').value],
    ['Year level', getRadio('year')],
    ['Status', getRadio('status')],
    ['Units', $('units').value],
    ['GPA / GWA', Number($('gwa').value).toFixed(2)],
    ['Laboratory courses', getLabs().join(', ')],
    ['Emergency contact', getValue('ecname') + ', ' + getValue('ecphone')],
    ['Password', '•'.repeat($('pw').value.length)],
    ['Uploaded file', file.name + ' (' + Math.round(file.size / 1024) + ' KB)'],
    ['Statement', getValue('essay')],
    ['Terms and honor code', 'Accepted']
  ];

  const list = $('sum');
  list.innerHTML = '';

  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value; // textContent keeps user input safe
    row.append(term, detail);
    list.append(row);
  });

  $('dlg').showModal();
}

// ---------- Modal buttons and reset ----------
$('edit').onclick = () => $('dlg').close();

$('ok').onclick = () => {
  $('dlg').close();
  $('f').reset();

  const toast = $('toast');
  toast.textContent = 'Registration confirmed (sample only, nothing was sent).';
  toast.classList.add('on');
  setTimeout(() => toast.classList.remove('on'), 3500);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

$('reset').addEventListener('click', () => {
  // Wait a moment so the browser clears the inputs first
  setTimeout(() => {
    touched.clear();
    document.querySelectorAll('.field').forEach(box => {
      box.classList.remove('bad', 'good');
      box.querySelector('.err').textContent = '';
    });
    $('prev').style.display = 'none';
    $('age').className = 'badge';
    $('age').textContent = 'Age appears here';
    $('meter').style.width = '0';
    $('banner').textContent = '';
    updateProgress();
  }, 0);
});

updateProgress();