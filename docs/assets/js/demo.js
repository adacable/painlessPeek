//#region shared/config.ts
var e = [
  {
    name: 'greyscale',
    description: 'Make the image black and white',
    peek: !1,
    filterString: 'grayscale(percent)',
    options: {
      enabled: {
        value: !1,
        type: 'checkbox',
        description: 'Enable greyscale filter',
      },
      percent: {
        value: 100,
        type: 'range',
        min: 0,
        max: 100,
        unit: '%',
        description: 'Greyscale amount',
      },
    },
  },
  {
    name: 'blur',
    description: 'Blur the image',
    peek: !1,
    filterString: 'blur(radius)',
    options: {
      enabled: {
        value: !1,
        type: 'checkbox',
        description: 'Enable blur filter',
      },
      radius: {
        value: 20,
        type: 'range',
        min: 0,
        max: 50,
        unit: 'px',
        description: 'Blur radius',
      },
    },
  },
  {
    name: 'reveal',
    description: 'Reveal the image on hover',
    peek: !0,
    options: {
      enabled: {
        value: !1,
        type: 'checkbox',
        description: 'Reveal the image slowly on hover',
      },
    },
  },
  {
    name: 'hue-rotate',
    description:
      'Rotate the hue of the image, to make colours appear different',
    peek: !1,
    filterString: 'hue-rotate(deg)',
    options: {
      enabled: {
        value: !1,
        type: 'checkbox',
        description: 'Enable hue-rotate filter',
      },
      deg: {
        value: 90,
        type: 'range',
        min: 0,
        max: 360,
        unit: 'deg',
        description: 'Hue rotation amount',
      },
    },
  },
  {
    name: 'letterbox',
    description: 'Reveal a small rectangle of the image on hover',
    peek: !0,
    options: {
      enabled: {
        value: !0,
        type: 'checkbox',
        description: 'Enable letterbox filter',
      },
      width: {
        value: 5,
        type: 'range',
        min: 0,
        max: 50,
        unit: '%',
        description: 'Letterbox window width',
      },
      height: {
        value: 5,
        type: 'range',
        min: 0,
        max: 50,
        unit: '%',
        description: 'Letterbox window height',
      },
    },
  },
];
//#endregion
//#region shared/state.ts
function t(e) {
  return Object.fromEntries(
    e.map((e) => [
      e.name,
      Object.fromEntries(
        Object.entries(e.options).map(([e, t]) => [e, t.value])
      ),
    ])
  );
}
//#endregion
//#region shared/content-utils.ts
function n(e, t) {
  let n = t
    .filter((t) => !t.peek && e.classList.contains(t.name))
    .map((t) => r(t, e));
  e.style.backdropFilter = n.join(' ');
}
function r(e, t) {
  if (!e.filterString) return '';
  let n = e.filterString;
  for (let [r, i] of Object.entries(e.options)) {
    if (r === 'enabled') continue;
    let e = t.getAttribute('data-' + r) ?? String(i.value),
      a = i.unit ?? '';
    n = n.replace(r, e + a);
  }
  return n;
}
function i(e) {
  let t = e.cloneNode(!0),
    n = document.createElement('div');
  for (let t = e.attributes.length - 1; t >= 0; --t)
    n.attributes.setNamedItem(e.attributes[t].cloneNode());
  let r = '';
  (e.tagName === 'IMG'
    ? (r = t.src)
    : e.style.backgroundImage?.startsWith('url') &&
      (r = e.style.backgroundImage.startsWith('url("')
        ? e.style.backgroundImage.slice(5, -2)
        : e.style.backgroundImage.slice(4, -1)),
    (n.style.backgroundImage = ''),
    (n.style.display = 'inline-block'));
  let i = document.createElement('div');
  i.classList.add('painlessPeek-filter-wrapper');
  let a = document.createElement('img');
  (r && (a.src = r),
    a.classList.add('painlessPeek-filter-image'),
    i.appendChild(a));
  let o = document.createElement('div');
  return (
    o.classList.add('painlessPeek-filter'),
    i.appendChild(o),
    n.appendChild(i),
    e.parentNode?.replaceChild(n, e),
    n
  );
}
//#endregion
//#region docs-src/demo.ts
var a = /* @__PURE__ */ new WeakMap();
function o(e) {
  let t = e.getAttribute('data-width') ?? '5',
    n = e.getAttribute('data-height') ?? '5';
  (e.style.setProperty('--rect-width', t + '%'),
    e.style.setProperty('--rect-height', n + '%'));
}
function s(e) {
  let t = e.querySelector('.painlessPeek-filter');
  if (!t) return;
  (t.classList.add('letterbox'), o(t));
  let n = (n) => {
      let r = e.getBoundingClientRect();
      ((t.style.left = n.clientX - r.left - (3 * e.offsetWidth) / 2 + 'px'),
        (t.style.top = n.clientY - r.top - (3 * e.offsetHeight) / 2 + 'px'));
    },
    r = () => {
      ((t.style.left = ''), (t.style.top = ''));
    };
  (a.set(e, {
    move: n,
    leave: r,
  }),
    e.addEventListener('mousemove', n),
    e.addEventListener('mouseleave', r));
}
function c(e) {
  e.querySelector('.painlessPeek-filter')?.classList.remove('letterbox');
  let t = a.get(e);
  t &&
    (e.removeEventListener('mousemove', t.move),
    e.removeEventListener('mouseleave', t.leave),
    a.delete(e));
}
function l(t, r) {
  t.forEach((t) => {
    let i = t.querySelector('.painlessPeek-filter');
    i &&
      e.forEach((a) => {
        let l = r[a.name];
        if (l) {
          if (a.name === 'letterbox') {
            (typeof l.width == 'number' &&
              i.setAttribute('data-width', String(l.width)),
              typeof l.height == 'number' &&
                i.setAttribute('data-height', String(l.height)),
              l.enabled && !i.classList.contains('letterbox')
                ? s(t)
                : !l.enabled && i.classList.contains('letterbox')
                  ? c(t)
                  : l.enabled && o(i));
            return;
          }
          for (let [e, t] of Object.entries(l))
            e !== 'enabled' && i.setAttribute('data-' + e, String(t));
          (l.enabled && !i.classList.contains(a.name)
            ? i.classList.add(a.name)
            : !l.enabled &&
              i.classList.contains(a.name) &&
              i.classList.remove(a.name),
            n(i, e));
        }
      });
  });
}
function u(t, n, r) {
  t.innerHTML = '';
  let i = e.filter((e) => e.peek),
    a = e.filter((e) => !e.peek),
    o = document.createElement('select');
  o.className = 'peeks';
  let s = document.createElement('option');
  ((s.textContent = 'none'),
    (s.value = ''),
    o.appendChild(s),
    i.forEach((e) => {
      let t = document.createElement('option');
      ((t.textContent = e.name),
        (t.value = e.name),
        n[e.name]?.enabled && (t.selected = !0),
        o.appendChild(t));
    }),
    o.addEventListener('change', () => {
      (i.forEach((e) => {
        n[e.name].enabled = e.name === o.value;
      }),
        r(n));
    }),
    t.appendChild(o),
    a.forEach((e) => {
      let i = n[e.name],
        a = document.createElement('form');
      ((a.className = 'filter'), (a.id = e.name));
      let o = document.createElement('h3');
      ((o.textContent = e.name), a.appendChild(o));
      for (let [t, o] of Object.entries(e.options))
        a.appendChild(d(t, o, i, e, n, r));
      t.appendChild(a);
    }));
}
function d(e, t, n, r, i, a) {
  let o = document.createElement('div');
  ((o.className = 'option'), o.classList.add(e));
  let s = document.createElement('input');
  ((s.type = t.type),
    (s.name = e),
    (s.className = 'option'),
    t.type === 'checkbox'
      ? (s.checked = n[e])
      : ((s.min = String(t.min)),
        (s.max = String(t.max)),
        (s.value = String(n[e]))),
    s.addEventListener('change', () => {
      let n = t.type === 'checkbox' ? s.checked : Number(s.value);
      ((i[r.name][e] = n), a(i));
    }),
    o.appendChild(s));
  let c = document.createElement('label');
  return ((c.textContent = e), c.classList.add(e), o.appendChild(c), o);
}
function f() {
  let n = Array.from(document.querySelectorAll('.demo img'));
  if (n.length === 0) return;
  let r = n.map((e) => i(e)),
    a = t(e),
    o = document.querySelector('.popup-demo');
  (o && u(o, a, (e) => l(r, e)), l(r, a));
}
document.addEventListener('DOMContentLoaded', f);
//#endregion
