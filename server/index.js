import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 3001;
const root = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(root, 'data.json');

app.use(express.json({ limit: '20kb' }));

async function readData() {
  return JSON.parse(await readFile(dataPath, 'utf8'));
}

async function saveData(data) {
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

app.get('/api/dashboard', async (_req, res, next) => {
  try {
    res.json(await readData());
  } catch (error) {
    next(error);
  }
});

app.post('/api/expenses', async (req, res, next) => {
  const { title, category, amount, date, paidVia } = req.body ?? {};
  const numericAmount = Number(amount);
  if (
    typeof title !== 'string' || !title.trim() || title.trim().length > 70 ||
    typeof category !== 'string' || !['Food', 'Travel', 'Study', 'Fun', 'Other'].includes(category) ||
    !Number.isFinite(numericAmount) || numericAmount <= 0 ||
    typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof paidVia !== 'string' || !['UPI', 'Cash', 'Card'].includes(paidVia)
  ) {
    return res.status(400).json({ error: 'Add a valid title, category, amount, date, and payment method.' });
  }

  try {
    const data = await readData();
    const expense = {
      id: randomUUID(),
      title: title.trim(),
      category,
      amount: numericAmount,
      date,
      paidVia,
    };
    data.expenses.unshift(expense);
    await saveData(data);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/expenses/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const nextExpenses = data.expenses.filter((expense) => expense.id !== req.params.id);
    if (nextExpenses.length === data.expenses.length) {
      return res.status(404).json({ error: 'That expense could not be found.' });
    }
    data.expenses = nextExpenses;
    await saveData(data);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.put('/api/budget', async (req, res, next) => {
  const budget = Number(req.body?.budget);
  if (!Number.isFinite(budget) || budget < 0 || budget > 10000000) {
    return res.status(400).json({ error: 'Enter a monthly budget between ₹0 and ₹1,00,00,000.' });
  }
  try {
    const data = await readData();
    data.budget = budget;
    await saveData(data);
    res.json({ budget: data.budget });
  } catch (error) {
    next(error);
  }
});

app.post('/api/upi/link', async (req, res, next) => {
  const handle = typeof req.body?.handle === 'string' ? req.body.handle.trim() : '';
  if (!/^[\w.-]{2,64}@[a-zA-Z0-9.-]{2,64}$/.test(handle)) {
    return res.status(400).json({ error: 'Enter a UPI ID in the format name@bank.' });
  }
  try {
    const data = await readData();
    data.upiHandle = handle;
    data.upiConnected = true;
    await saveData(data);
    res.json({ upiHandle: data.upiHandle, upiConnected: data.upiConnected });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/upi/link', async (_req, res, next) => {
  try {
    const data = await readData();
    data.upiHandle = '';
    data.upiConnected = false;
    await saveData(data);
    res.json({ upiHandle: '', upiConnected: false });
  } catch (error) {
    next(error);
  }
});

app.post('/api/pocket-requests', async (req, res, next) => {
  const amount = Number(req.body?.amount);
  const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000 || note.length > 120) {
    return res.status(400).json({ error: 'Enter an amount between ₹1 and ₹1,00,000 and a short note.' });
  }
  try {
    const data = await readData();
    const request = {
      id: randomUUID(),
      amount,
      note,
      status: 'Saved',
      createdAt: new Date().toISOString(),
    };
    data.requests.unshift(request);
    await saveData(data);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong while saving. Please try again.' });
});

app.listen(port, () => {
  console.log(`Broke But Brilliant API ready at http://localhost:${port}`);
});
