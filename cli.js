#!/usr/bin/env node

import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { CybeNodeMail } from './CybeNodeMail.js';

// ثيم الجداول المحسن بحواف انسيابية دائرية
const tableTheme = {
  chars: {
    'top': '─', 'top-mid': '┬', 'top-left': '╭', 'top-right': '╮',
    'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '╰', 'bottom-right': '╯',
    'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
    'right': '│', 'right-mid': '┤', 'middle': '│'
  }
};

// دالة تأخير زمني للأنيميشن
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// أنيميشن العدّاد الرقمي الفخم قبل اللوجو
async function playIntroAnimation() {
  console.clear();
  const loadingSteps = [
    " ⚡ INITIALIZING CORE [ 10% ] ░░░░░░░░░░",
    " ⚡ CONNECTING WORKER [ 35% ] ███░░░░░░░",
    " ⚡ FETCHING ENCRYPTION [ 70% ] ███████░░░",
    " ⚡ LAUNCHING CYBENODE [ 100% ] ██████████"
  ];

  for (const step of loadingSteps) {
    process.stdout.write(`\r${chalk.hex('#00E5FF').bold(step)}`);
    await sleep(150);
  }
  await sleep(200);
  console.clear();
}

function printLogo() {
  console.log(chalk.hex('#00F5FF').bold(`
╭──────────────────────────────────────────────────────────╮
│   ██████╗██╗   ██╗██████╗ ███████╗███╗   ██╗███████╗     │
│  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝████╗  ██║██╔════╝     │
│  ██║      ╚████╔╝ ██████╔╝█████╗  ██╔██╗ ██║█████╗       │
│  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝       │
│  ╚██████╗   ██║   ██████╔╝███████╗██║ ╚████║███████╗     │
│   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝     │
│                                                          │
│   ● TEMPORARY MAIL ENGINE v3.0  | 🌐 EDGE NETWORK         │
╰──────────────────────────────────────────────────────────╯`));
  console.log();
}

async function main() {
  // تشغيل أنيميشن الأرقام أولاً
  await playIntroAnimation();
  
  // طباعة اللوجو الفخم
  printLogo();

  const mail = new CybeNodeMail();

  const spinner = ora({
    text: chalk.hex('#00E5FF')(" [1/2] Deploying secure address on Cloudflare..."),
    spinner: 'arc',
    color: 'cyan'
  }).start();

  try {
    const acc = await mail.createRandomAccount();
    spinner.succeed(chalk.hex('#00FF88').bold(" [2/2] Temporary Identity Activated Successfully!\n"));

    // كارت عرض معلومات الحساب الفخم
    const card = new Table({
      ...tableTheme,
      style: { head: [], border: ['cyan'] }
    });

    card.push(
      { [chalk.bold.hex('#00F5FF')('📧 EMAIL ADDRESS')]: chalk.bold.yellow(acc.address) },
      { [chalk.bold.hex('#00F5FF')('🔑 ACCESS PASS')]:   chalk.bold.magenta(acc.password) },
      { [chalk.bold.hex('#00F5FF')('🛡️ BEARER TOKEN')]:  chalk.gray(acc.token.substring(0, 32) + "...") }
    );

    console.log(card.toString());
    console.log(chalk.hex('#334155')("\n─ ─ ─ ─ ─ ─ ─ ─ 🔮 LIVE INBOX STREAM ACTIVE ─ ─ ─ ─ ─ ─ ─ ─\n"));

    let lastCount = 0;
    const watchSpinner = ora({
      text: chalk.hex('#FFB800')(" Waiting for incoming mail (polling every 5s)..."),
      spinner: 'dots12',
      color: 'yellow'
    }).start();

    setInterval(async () => {
      try {
        const msgs = await mail.getMessages();
        watchSpinner.text = chalk.hex('#00E5FF')(` Monitoring inbox... [Total Items: ${msgs.length}]`);

        if (msgs.length > lastCount) {
          lastCount = msgs.length;
          watchSpinner.stop();

          console.log("\n" + chalk.hex('#00FF88').bold("📬 NEW MESSAGE DETECTED:"));

          const table = new Table({
            ...tableTheme,
            head: [
              chalk.bold.hex('#00F5FF')('ID'),
              chalk.bold.hex('#00F5FF')('SENDER'),
              chalk.bold.hex('#00F5FF')('SUBJECT'),
              chalk.bold.hex('#00F5FF')('TIME')
            ],
            colWidths: [10, 20, 22, 12],
            style: { border: ['gray'] }
          });

          msgs.forEach(m => {
            table.push([
              chalk.gray(m.id.substring(0, 6)),
              chalk.green(m.from.address.substring(0, 18)),
              chalk.white.bold(m.subject ? m.subject.substring(0, 20) : "No Subject"),
              chalk.yellow(new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            ]);
          });

          console.log(table.toString());
          console.log();
          watchSpinner.start();
        }
      } catch (err) {
        // Ignored
      }
    }, 5000);

  } catch (err) {
    spinner.fail(chalk.red.bold(" Critical Connection Error: ") + chalk.white(err.message));
  }
}

main();
