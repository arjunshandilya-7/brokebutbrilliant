import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const categories = ['Food', 'Travel', 'Study', 'Fun', 'Other'];
const categoryIcons = { Food: '🍜', Travel: '🚌', Study: '📚', Fun: '🕹️', Other: '✨' };
const moneyTips = [
  {
    category: 'SPEND WITH A PLAN',
    title: 'Give your snack money a weekly cap',
    advice: 'Pick a small amount for café runs and treats each week. When it’s used up, take a breather until next week—no guilt, just a plan.',
    action: 'Choose your weekly treat limit.',
    icon: '🍪',
  },
  {
    category: 'BEAT IMPULSE BUYS',
    title: 'Try the 24-hour pause',
    advice: 'Want something that isn’t urgent? Save it to a wishlist and wait a day. If it still feels worth it and fits your budget, decide then.',
    action: 'Pause before your next non-essential buy.',
    icon: '⏳',
  },
  {
    category: 'SAVE A LITTLE',
    title: 'Save a small amount first',
    advice: 'When your allowance arrives, move a manageable amount aside for a goal before the week gets busy. Even a small start counts.',
    action: 'Pick a mini savings goal.',
    icon: '🐷',
  },
  {
    category: 'CAMPUS HACK',
    title: 'Pack water and a snack',
    advice: 'A refillable bottle and something from home can make those between-class snack runs less tempting—and free up cash for what you really want.',
    action: 'Pack one thing before your next class.',
    icon: '🥤',
  },
  {
    category: 'STUDENT PERKS',
    title: 'Check for a student discount',
    advice: 'Before paying full price for software, transport, events, or food, check the official student offer. Your student ID might unlock a better deal.',
    action: 'Ask about a student rate.',
    icon: '🎓',
  },
  {
    category: 'MAKE IT LAST',
    title: 'Split your allowance by week',
    advice: 'Divide your monthly spending money into weekly portions. It’s easier to pace your spending when you can see what’s for this week.',
    action: 'Try a weekly spending limit.',
    icon: '🗓️',
  },
  {
    category: 'SNEAKY SPENDS',
    title: 'Give subscriptions a quick check',
    advice: 'Look over your recurring payments once a month. If you haven’t used one lately, consider pausing or cancelling it.',
    action: 'Review one recurring payment.',
    icon: '🔎',
  },
  {
    category: 'FRIENDLY FINANCES',
    title: 'Agree on the split before ordering',
    advice: 'For a group meal or ride, decide how you’ll split it before someone pays. It keeps money stuff clear and the hangout easy.',
    action: 'Settle the split before checkout.',
    icon: '🤝',
  },
];
const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const money = (amount) => `₹${currency.format(amount || 0)}`;
function buildPersonalizedTip(expenses, budget) {
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce((totals, expense) => {
    const category = totals[expense.category] || { amount: 0, count: 0 };
    category.amount += expense.amount;
    category.count += 1;
    totals[expense.category] = category;
    return totals;
  }, {});
  const topCategory = Object.entries(categoryTotals)
    .sort(([, first], [, second]) => second.amount - first.amount)[0];

  if (!expenses.length) {
    return {
      personalized: true,
      category: 'YOUR SPENDING SNAPSHOT',
      title: 'Log a few expenses to get your first personal tip',
      advice: 'Once you record a couple of this month’s purchases, Broke But Brilliant can spot your biggest spending category and give you a tip based on it.',
      action: 'Add a recent expense to get started.',
      icon: '🧾',
    };
  }

  if (budget > 0 && spent >= budget) {
    return {
      personalized: true,
      category: 'YOUR BUDGET CHECK-IN',
      title: `You’ve used ${money(spent)} of your ${money(budget)} budget`,
      advice: `Your recorded spending is over this month’s limit. ${topCategory[0]} is your top category at ${money(topCategory[1].amount)}. Take a quick look at upcoming costs and pause only the flexible extras that work for you.`,
      action: `Review your ${topCategory[0].toLowerCase()} spending before your next purchase.`,
      icon: '🧭',
    };
  }

  if (budget > 0 && spent / budget >= 0.75) {
    const now = new Date();
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
    const perDay = Math.floor((budget - spent) / daysLeft);
    return {
      personalized: true,
      category: 'YOUR BUDGET CHECK-IN',
      title: `${Math.round((spent / budget) * 100)}% of your monthly budget is used`,
      advice: `You’ve logged ${money(spent)} so far, with ${money(budget - spent)} left. Keeping spending near ${money(perDay)} a day for the rest of the month may help you stay on track.`,
      action: 'Set a small daily or weekly limit that feels realistic.',
      icon: '🧭',
    };
  }

  const [category, details] = topCategory;
  const share = Math.round((details.amount / spent) * 100);
  const categoryAdvice = {
    Food: 'A planned café or snack amount for next week could help you keep room for other things you enjoy.',
    Travel: 'Check whether a student transit pass or a route you already use could make your next few trips cheaper.',
    Study: 'Before buying more supplies, see if something can be reused, borrowed, or found second-hand. Keep what you need for class.',
    Fun: 'Try choosing a fun-money limit before your next outing, so you can enjoy it without guessing what’s left.',
    Other: 'A quick note beside your next few purchases can help explain what makes up this category.',
  };
  const categoryActions = {
    Food: 'Pick a weekly café and snack limit.',
    Travel: 'Check your student fare options.',
    Study: 'Check for reusable or borrowed supplies.',
    Fun: 'Choose a fun budget before you head out.',
    Other: 'Add a note to your next “Other” expense.',
  };

  return {
    personalized: true,
    category: `BASED ON ${expenses.length} LOGGED ${expenses.length === 1 ? 'SPEND' : 'SPENDS'}`,
    title: `${category} is your top category at ${money(details.amount)}`,
    advice: `${category} makes up ${share}% of your recorded ${money(spent)} this month. ${categoryAdvice[category] || categoryAdvice.Other}`,
    action: categoryActions[category] || categoryActions.Other,
    icon: categoryIcons[category] || '✨',
  };
}
const localDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const today = localDate(new Date());
const dateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDate(date);
};
const isGitHubPages = import.meta.env.BASE_URL !== '/';
const previewData = {
  budget: 12000,
  upiHandle: '',
  upiConnected: false,
  expenses: [
    { id: 'preview-1', title: 'Cappuccino & sandwich', category: 'Food', amount: 185, date: dateDaysAgo(0), paidVia: 'UPI' },
    { id: 'preview-2', title: 'Metro top-up', category: 'Travel', amount: 250, date: dateDaysAgo(1), paidVia: 'UPI' },
    { id: 'preview-3', title: 'Studio supplies', category: 'Study', amount: 420, date: dateDaysAgo(2), paidVia: 'Card' },
    { id: 'preview-4', title: 'Late-night momos', category: 'Food', amount: 120, date: dateDaysAgo(3), paidVia: 'UPI' },
  ],
  requests: [],
};
const weeklyLimit = 2500;

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Could not complete that action.');
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [data, setData] = useState(isGitHubPages ? previewData : { budget: 12000, upiHandle: '', upiConnected: false, expenses: [], requests: [] });
  const [page, setPage] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  async function refresh() {
    setData(await api('/api/dashboard'));
  }

  useEffect(() => {
    if (isGitHubPages) {
      setLoading(false);
      return;
    }
    refresh().catch((error) => setToast(error.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const monthExpenses = useMemo(() => data.expenses.filter((expense) => {
    const date = new Date(`${expense.date}T00:00:00`);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }), [data.expenses]);
  const weeklySpending = useMemo(() => {
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
      const dateKey = localDate(date);
      return {
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateKey,
        amount: data.expenses
          .filter((expense) => expense.date === dateKey)
          .reduce((sum, expense) => sum + expense.amount, 0),
      };
    });
  }, [data.expenses]);
  const weekTotal = weeklySpending.reduce((sum, day) => sum + day.amount, 0);
  const chartMaximum = Math.max(1, ...weeklySpending.map((day) => day.amount));
  const spent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = Math.max(0, data.budget - spent);
  const progress = data.budget ? Math.min(100, (spent / data.budget) * 100) : 0;
  const remainingPercent = data.budget ? Math.round((remaining / data.budget) * 100) : 0;
  const personalizedTip = useMemo(() => buildPersonalizedTip(monthExpenses, data.budget), [monthExpenses, data.budget]);
  const allTips = useMemo(() => [personalizedTip, ...moneyTips], [personalizedTip]);
  const visibleExpenses = useMemo(() => data.expenses.filter((expense) => (
    (filter === 'All' || expense.category === filter) &&
    expense.title.toLowerCase().includes(query.toLowerCase())
  )), [data.expenses, filter, query]);
  const firstName = 'Student';

  async function runAction(action, successMessage) {
    if (isGitHubPages) {
      setToast('Preview only: changes are not saved on GitHub Pages.');
      return;
    }
    setBusy(true);
    try {
      await action();
      await refresh();
      setTipIndex(0);
      setModal('');
      setToast(successMessage);
    } catch (error) {
      setToast(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function shareRequest(request) {
    const reason = request.note ? ` It's for ${request.note}.` : '';
    const text = `Hey! Could you send me ${money(request.amount)} for my pocket money?${reason}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pocket money request', text });
        setToast('Share sheet opened.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setToast('Request copied. Paste it into a message to your parents.');
      } else {
        window.location.href = `mailto:?subject=${encodeURIComponent('Pocket money request')}&body=${encodeURIComponent(text)}`;
      }
    } catch (error) {
      if (error.name !== 'AbortError') setToast('Could not share this request. Please try again.');
    }
  }

  const openExpense = () => setModal('expense');
  const navItems = [
    ['Overview', '▦'],
    ['Activity', '↗'],
    ['Money tips', '✦'],
    ['Pocket money', '♡'],
    ['UPI setup', '⌁'],
  ];
  const dailyTip = allTips[tipIndex % allTips.length];
  const nextTip = () => setTipIndex((current) => (current + 1) % allTips.length);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage('Overview'); }}>
          <span className="brand-icon">BB</span>
          <span className="brand-name">Broke But<br /><span>Brilliant</span><small>STUDENT MONEY CLUB</small></span>
        </a>
        <div className="side-label">YOUR SPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(([label, icon]) => (
            <button key={label} className={`nav-item ${page === label ? 'selected' : ''}`} onClick={() => setPage(label)}>
              <span className="nav-symbol">{icon}</span>{label}
              {label === 'Pocket money' && data.requests.some((request) => request.status === 'Saved') && <i className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="side-quest">
          <div className="quest-stars">✦ ✧ ✦</div>
          <span className="quest-tag">WEEKLY QUEST</span>
          <strong>Stay under {money(weeklyLimit)}</strong>
          <p>Every little win adds up. You’ve got this!</p>
          <div className="quest-track"><span style={{ width: `${Math.min(100, (weekTotal / weeklyLimit) * 100)}%` }} /></div>
          <small>{money(weekTotal)} <span>spent this week</span></small>
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">S</div><div className="profile-name">Student<small>New player · Money quest</small></div>
          <button className="more-button" aria-label="Open settings" onClick={() => setPage('UPI setup')}>···</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>MY MONEY</span><b>/</b> {page.toUpperCase()}</div>
          <div className="topbar-right">
            <span className="streak"><span>✦</span> STUDENT MONEY CLUB</span>
            <button className="avatar top-avatar" aria-label="Your profile">S</button>
          </div>
        </header>

        <div className="page-content">
          {loading ? <div className="loading-state">Loading your money universe<span> ···</span></div> : (
            <>
              {isGitHubPages && <div className="preview-notice" role="status">GITHUB PAGES PREVIEW · Sample data only; changes are not saved.</div>}
              {page === 'Overview' && (
                <>
                  <section className="hero">
                    <div className="hero-copy">
                      <div className="hero-kicker"><span className="live-dot" /> YOUR MONEY, YOUR GAME</div>
                      <h1>Hey, {firstName}!<br /><span>Ready to level up?</span></h1>
                      <p>You’re doing better than you think. Here’s your money snapshot.</p>
                      <button className="primary-button" onClick={openExpense}>＋ Log an expense <span>↗</span></button>
                    </div>
                    <div className="hero-art" aria-hidden="true">
                      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                      <div className="coin coin-back">₹</div><div className="coin coin-front">₹</div>
                      <div className="spark spark-one">✦</div><div className="spark spark-two">✧</div>
                      <div className="pixel-block block-one" /><div className="pixel-block block-two" />
                      <div className="level-chip">LVL 03 <span>▲</span></div>
                    </div>
                    <div className="hero-foot"><span>✦</span> YOUR {new Date().toLocaleDateString('en-IN', { month: 'long' }).toUpperCase()} ADVENTURE <span className="hero-foot-right">ONE SMART CHOICE AT A TIME</span></div>
                  </section>

                  <section className="stats-grid">
                    <article className="stat-card balance-card money-jar-card">
                      <div className="money-jar-visual" role="img" aria-label={`${remainingPercent}% of this month's budget remains`}>
                        <span className="jar-sparkle jar-sparkle-one">✦</span>
                        <span className="jar-sparkle jar-sparkle-two">✧</span>
                        <div className="jar-lid" />
                        <div className="jar-neck"><span /></div>
                        <div className="jar-body">
                          <div className="jar-interior">
                            <div className="jar-liquid" style={{ height: `${remainingPercent}%` }} />
                            <div className="jar-coin jar-coin-one">₹</div>
                            <div className="jar-coin jar-coin-two">₹</div>
                            <div className="jar-glint" />
                          </div>
                        </div>
                        <div className="jar-shadow" />
                      </div>
                      <div className="jar-info">
                        <div className="stat-header"><span>LEFT TO PLAY WITH</span><button className="edit-budget" onClick={() => setModal('budget')}>EDIT</button></div>
                        <strong>{money(remaining)}</strong>
                        <small>of {money(data.budget)} this month</small>
                        <div className="jar-meter"><span style={{ width: `${remainingPercent}%` }} /></div>
                        <div className="jar-remaining"><span>{remainingPercent}% left in your jar</span><span>✦</span></div>
                      </div>
                    </article>
                    <article className="stat-card">
                    <div className="stat-header"><span>SPENT THIS MONTH</span><span className="stat-icon spend-model" aria-hidden="true"><i>₹</i><b /></span></div>
                      <strong>{money(spent)}</strong><small>Across {monthExpenses.length} money moves</small>
                      <div className="stat-foot stat-note"><span className="trend-up">↗</span> Keep an eye on the little things</div>
                    </article>
                    <article className="stat-card">
                    <div className="stat-header"><span>MONEY MOVES</span><span className="stat-icon moves-model" aria-hidden="true"><i /><i /><i /></span></div>
                      <strong>{monthExpenses.length} <em>moves</em></strong><small>Logged so far this month</small>
                      <div className="stat-foot stat-note">Every entry is a little more awareness.</div>
                    </article>
                  </section>

                  <section className="dashboard-grid">
                    <article className="panel spending-panel">
                      <div className="panel-heading">
                        <div><div className="section-eyebrow">THE BIG PICTURE</div><h2>Spending rhythm <span className="heading-spark">✳</span></h2></div>
                        <button className="period-button">This week <span>⌄</span></button>
                      </div>
                      <div className="chart-total"><strong>{money(weekTotal)}</strong><small>spent this week</small></div>
                      <div className="chart" aria-label="Spending by day this week">
                        {weeklySpending.map((day) => (
                          <div className="chart-column" key={day.dateKey}>
                            <span className={`bar ${day.amount === chartMaximum && day.amount > 0 ? 'bar-highlight' : ''}`} style={{ height: `${Math.max(8, (day.amount / chartMaximum) * 88)}%` }} title={`${day.dateKey}: ${money(day.amount)}`}>
                            </span><small>{day.label}</small>
                          </div>
                        ))}
                      </div>
                      <div className="chart-caption"><span><i /> Daily spending</span><span>Little wins count <b>✦</b></span></div>
                    </article>

                    <article className="panel quick-panel">
                      <div className="panel-heading"><div><div className="section-eyebrow">SHORTCUTS</div><h2>Quick plays</h2></div><span className="quick-mascot">⚡</span></div>
                      <button className="quick-action" onClick={openExpense}><span className="quick-icon q-orange">＋</span><span><b>Log an expense</b><small>Capture a money move</small></span><i>↗</i></button>
                      <button className="quick-action" onClick={() => setPage('UPI setup')}><span className="quick-icon q-green">⌁</span><span><b>{data.upiConnected ? 'UPI connected · demo' : 'Connect your UPI'}</b><small>{data.upiHandle || 'Link an ID for this demo'}</small></span><i>↗</i></button>
                      <button className="quick-action" onClick={() => setModal('request')}><span className="quick-icon q-purple">♡</span><span><b>Ask for pocket money</b><small>Write a note to share with your folks</small></span><i>↗</i></button>
                      <div className="quick-foot">POWER UP YOUR MONEY HABITS <span>✦</span></div>
                    </article>
                  </section>

                  <section className="daily-tip panel">
                    <div className="tip-badge" aria-hidden="true">{dailyTip.icon}</div>
                    <div className="daily-tip-copy">
                      <div className="section-eyebrow">{dailyTip.personalized ? 'YOUR PERSONALIZED MONEY POWER-UP' : 'TODAY’S MONEY POWER-UP'} <span>✦ {dailyTip.category}</span></div>
                      <h2>{dailyTip.title}</h2>
                      <p>{dailyTip.advice}</p>
                      <div className="tip-action"><span>TRY THIS:</span> {dailyTip.action}</div>
                    </div>
                    <div className="daily-tip-actions">
                      <button className="tip-next" onClick={nextTip}>Another tip ↻</button>
                      <button className="text-button" onClick={() => setPage('Money tips')}>All money tips →</button>
                    </div>
                  </section>

                  <section className="panel activity-panel">
                    <div className="panel-heading activity-heading">
                      <div className="activity-heading-copy">
                        <div className="section-eyebrow">LATEST MOVES</div>
                        <div className="activity-title-row"><h2>Recent activity</h2><span className="activity-count">{data.expenses.length} MOVES</span></div>
                      </div>
                      <button className="text-button activity-link" onClick={() => setPage('Activity')}>SEE ALL <span>↗</span></button>
                    </div>
                    <ExpenseList expenses={data.expenses.slice(0, 4)} onDelete={(id) => runAction(() => api(`/api/expenses/${id}`, { method: 'DELETE' }), 'Expense removed.')} />
                  </section>
                  <footer className="page-footer">MADE FOR THE STUDENT SIDE QUEST <span>✳</span> BROKE BUT BRILLIANT © 2026</footer>
                </>
              )}

              {page === 'Activity' && (
                <section className="inner-page">
                  <div className="page-title-row"><div><div className="section-eyebrow">YOUR MONEY TRAIL</div><h1>Activity <span className="heading-spark">✳</span></h1><p>Every little money move, all in one place.</p></div><button className="primary-button" onClick={openExpense}>＋ Log an expense</button></div>
                  <div className="panel activity-panel">
                    <div className="filters"><input aria-label="Search activity" placeholder="Search your activity..." value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter by category" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
                    <ExpenseList expenses={visibleExpenses} onDelete={(id) => runAction(() => api(`/api/expenses/${id}`, { method: 'DELETE' }), 'Expense removed.')} />
                  </div>
                  <footer className="page-footer">MADE FOR THE STUDENT SIDE QUEST <span>✳</span> BROKE BUT BRILLIANT © 2026</footer>
                </section>
              )}

              {page === 'Money tips' && (
                <section className="inner-page">
                  <div className="page-title-row"><div><div className="section-eyebrow">TINY HABITS, BIG WINS</div><h1>Money tips <span className="heading-spark">✳</span></h1><p>Friendly, low-pressure ideas to help your student budget go further.</p></div></div>
                  <article className="daily-tip tip-featured panel">
                    <div className="tip-badge" aria-hidden="true">{dailyTip.icon}</div>
                    <div className="daily-tip-copy">
                      <div className="section-eyebrow">{dailyTip.personalized ? 'YOUR PERSONALIZED MONEY POWER-UP' : 'YOUR NEXT MONEY POWER-UP'} <span>✦ {dailyTip.category}</span></div>
                      <h2>{dailyTip.title}</h2>
                      <p>{dailyTip.advice}</p>
                      <div className="tip-action"><span>TRY THIS:</span> {dailyTip.action}</div>
                    </div>
                    <div className="daily-tip-actions">
                      <button className="tip-next" onClick={nextTip}>Show another tip ↻</button>
                    </div>
                  </article>
                  <div className="tips-grid">
                    {allTips.map((tip, index) => (
                      <article className={`tip-card panel ${tip.personalized ? 'tip-card-personalized' : ''}`} key={tip.title}>
                        <div className="tip-card-top"><span className="tip-card-icon">{tip.icon}</span><span className="section-eyebrow">{tip.personalized ? 'FOR YOU' : `TIP ${String(index).padStart(2, '0')}`}</span></div>
                        <div className="tip-card-category">{tip.category}</div>
                        <h2>{tip.title}</h2>
                        <p>{tip.advice}</p>
                        <div className="tip-card-action"><span>TRY THIS</span>{tip.action}</div>
                      </article>
                    ))}
                  </div>
                  <footer className="page-footer">SMALL STEPS COUNT <span>✳</span> BROKE BUT BRILLIANT © 2026</footer>
                </section>
              )}

              {page === 'Pocket money' && (
                <section className="inner-page">
                  <div className="page-title-row"><div><div className="section-eyebrow">A LITTLE BOOST</div><h1>Pocket money <span className="heading-spark">♡</span></h1><p>Ask your parents for a top-up without the awkward text.</p></div><button className="primary-button" onClick={() => setModal('request')}>♡ Make a request</button></div>
                  <div className="pocket-banner"><div className="pocket-emoji">💌</div><div><span>THE RESPONSIBLE ASK</span><h2>Good plans deserve a little backup.</h2><p>Write a note, choose an amount, and keep track of your requests here.</p></div><span className="banner-spark">✦</span></div>
                  <div className="panel request-panel"><div className="panel-heading"><div><div className="section-eyebrow">YOUR REQUESTS</div><h2>Request history</h2></div><span className="demo-label">DEMO TRACKER</span></div>
                    {data.requests.length ? data.requests.map((request) => <div className="request-row" key={request.id}><div className="request-icon">♡</div><div className="request-copy"><b>{request.note || 'Pocket money request'}</b><small>{new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Saved on this device</small></div><strong>{money(request.amount)}</strong><button className="share-button" onClick={() => shareRequest(request)}>Share ↗</button></div>) : <div className="empty-state"><span>🪙</span><b>No requests yet</b><p>Your pocket-money requests will show up here.</p></div>}
                  </div>
                  <div className="info-note"><span>ⓘ</span> Requests are saved here. Use Share to send the request text yourself; this app never messages anyone or transfers money.</div>
                  <footer className="page-footer">MADE FOR THE STUDENT SIDE QUEST <span>✳</span> BROKE BUT BRILLIANT © 2026</footer>
                </section>
              )}

              {page === 'UPI setup' && (
                <section className="inner-page">
                  <div className="page-title-row"><div><div className="section-eyebrow">FASTER CHECK-INS</div><h1>Connect UPI <span className="heading-spark">⌁</span></h1><p>Link your UPI ID in this prototype and keep your expense tracking moving.</p></div></div>
                  <div className="upi-layout">
                    <div className="panel upi-panel">
                      <div className="upi-art">⌁<span>₹</span></div>
                      <div className="section-eyebrow">YOUR PAYMENT SHORTCUT</div>
                      <h2>{data.upiConnected ? 'UPI connected!' : 'Connect your UPI'}</h2>
                      <p>{data.upiConnected ? 'Your UPI ID is linked in this prototype. Your connection status is saved on this device.' : 'Enter your UPI ID to connect it in this prototype and save the connection status.'}</p>
                      {data.upiConnected ? (
                        <div className="linked-id">
                          <span><i /> CONNECTED · DEMO</span>
                          <b>{data.upiHandle}</b>
                          <button className="outline-button" disabled={busy} onClick={() => runAction(() => api('/api/upi/link', { method: 'DELETE' }), 'UPI disconnected.')}>Disconnect UPI</button>
                        </div>
                      ) : (
                        <form className="upi-form" onSubmit={(event) => {
                          event.preventDefault();
                          const handle = new FormData(event.currentTarget).get('handle');
                          runAction(() => api('/api/upi/link', { method: 'POST', body: JSON.stringify({ handle }) }), 'UPI connected for this demo.');
                        }}>
                          <label htmlFor="upi-handle">UPI ID</label>
                          <div className="input-with-prefix"><span>⌁</span><input id="upi-handle" name="handle" placeholder="yourname@bank" defaultValue={data.upiHandle} required maxLength="130" /></div>
                          <button className="primary-button" disabled={busy}>{busy ? 'Connecting...' : 'Connect UPI'} <span>→</span></button>
                        </form>
                      )}
                      <div className="safe-note"><span>🔒</span> Prototype connection only: never enter your UPI PIN or bank password.</div>
                    </div>
                    <div className="upi-side-card"><span className="side-card-icon">👾</span><div className="section-eyebrow">CONNECTION PREVIEW</div><h3>One tap to link your ID.</h3><p>This prototype saves your UPI ID and connection status. Live bank transactions are not imported yet, so keep adding expenses in the tracker.</p><div className="side-card-line" /><small>NO PIN OR BANK PASSWORD REQUIRED</small></div>
                  </div>
                  <footer className="page-footer">MADE FOR THE STUDENT SIDE QUEST <span>✳</span> BROKE BUT BRILLIANT © 2026</footer>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {modal && <Modal type={modal} budget={data.budget} busy={busy} onClose={() => setModal('')} onSubmit={(form) => {
        const body = Object.fromEntries(form.entries());
        const action = modal === 'expense'
          ? api('/api/expenses', { method: 'POST', body: JSON.stringify({ ...body, amount: Number(body.amount) }) })
          : modal === 'budget'
            ? api('/api/budget', { method: 'PUT', body: JSON.stringify({ budget: Number(body.amount) }) })
            : api('/api/pocket-requests', { method: 'POST', body: JSON.stringify({ ...body, amount: Number(body.amount) }) });
        const message = modal === 'expense' ? 'Expense added. Nice one!' : modal === 'budget' ? 'Monthly budget updated.' : 'Request saved. Tap Share to send it to your parents.';
        runAction(() => action, message);
      }} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function ExpenseList({ expenses, onDelete }) {
  if (!expenses.length) return <div className="empty-state"><span>🪙</span><b>No money moves yet</b><p>Log your first expense to kick things off.</p></div>;
  return <div className="expense-list">{expenses.map((expense) => (
    <div className="expense-row" key={expense.id}>
      <div className={`expense-icon cat-${expense.category.toLowerCase()}`}>{categoryIcons[expense.category] || '✨'}</div>
      <div className="expense-copy"><b>{expense.title}</b><small>{new Date(`${expense.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} <span>·</span> {expense.paidVia}</small></div>
      <span className={`category-chip chip-${expense.category.toLowerCase()}`}>{expense.category}</span><strong className="expense-amount">−{money(expense.amount)}</strong>
      <button className="delete-expense" title={`Delete ${expense.title}`} onClick={() => onDelete(expense.id)}>×</button>
    </div>
  ))}</div>;
}

function Modal({ type, budget, busy, onClose, onSubmit }) {
  const isExpense = type === 'expense';
  const isRequest = type === 'request';
  const isBudget = type === 'budget';
  const title = isExpense ? 'Log an expense' : isRequest ? 'Request pocket money' : 'Set your budget';
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="modal-card" onSubmit={(event) => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); }}>
      <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
      <div className="modal-kicker">{isExpense ? 'TRACK THAT POWER-UP' : isRequest ? 'WRITE A LITTLE NOTE' : 'PLAN YOUR MONTH'}</div>
      <h2>{title} <span>{isExpense ? '✳' : isRequest ? '♡' : '◈'}</span></h2>
      <p>{isExpense ? 'No spend is too small to keep track of.' : isRequest ? 'A thoughtful ask goes a long way.' : 'Pick a monthly limit that works for you.'}</p>
      <label htmlFor="amount">{isExpense ? 'What did you spend on?' : isRequest ? 'How much do you need?' : 'Monthly spending limit'}</label>
      {isExpense && <input name="title" id="title" placeholder="e.g. Chai between classes" required maxLength="70" />}
      <div className="amount-input"><span>₹</span><input id="amount" name="amount" type="number" placeholder="0" defaultValue={isBudget ? budget : undefined} min={isBudget ? '0' : '1'} max={isRequest ? '100000' : undefined} step="1" required /></div>
      {isExpense ? <div className="modal-fields">
        <div><label htmlFor="category">CATEGORY</label><select name="category" id="category">{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div><label htmlFor="paidVia">PAID WITH</label><select name="paidVia" id="paidVia"><option>UPI</option><option>Cash</option><option>Card</option></select></div>
        <div className="wide-field"><label htmlFor="date">DATE</label><input id="date" name="date" type="date" defaultValue={today} required /></div>
      </div> : isRequest && <><label htmlFor="note">WHAT'S IT FOR? <span className="optional-label">OPTIONAL</span></label><textarea id="note" name="note" placeholder="e.g. Lab supplies for my project" maxLength="120" rows="3" /></>}
      <button type="submit" className="primary-button modal-submit" disabled={busy}>{busy ? 'Saving...' : isExpense ? 'Save expense' : isRequest ? 'Save request' : 'Save budget'} <span>→</span></button>
      {isRequest && <small className="modal-disclaimer">Saved here first. You can share the request from your request history.</small>}
    </form>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
