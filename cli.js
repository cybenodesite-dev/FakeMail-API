#!/usr/bin/env node

import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { CybeNodeMail } from './CybeNodeMail.js';

// طباعة شعار ASCII أنيق في بداية التيرمنال
function printBanner() {
  console.clear();
  console.log(chalk.cyan.bold(`
  ██╗  ██╗   ██████╗██╗  ██╗██████╗ ███████╗███╗   ██╗███████╗
  ██║  ██║  ██╔════╝╚██╗██╔╝██╔══██╗██╔════╝████╗  ██║██╔════╝
  ███████║  ██║      ╚███╔╝ ██████╔╝█████╗  ██╔██╗ ██║█████╗  
  ██╔══██║  ██║      ██╔██╗ ██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝  
  ██║  ██║  ╚██████╗██╔╝ ██╗██████╔╝███████╗██║ ╚████║███████╗
  ╚═╝  ╚═╝   ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝
  `));
  console.log(chalk.yellow.bold("       === CybeNode Temporary Mail Terminal CLI v1.0 ===\n"));
}

async function main() {
  printBanner();
  const mail = new CybeNodeMail();

  // 1. مؤشر إنشاء الحساب
  const spinner = ora(chalk.blue("جاري إنشاء بريد إلكتروني مؤقت من الخادم...")).start();

  try {
    const acc = await mail.createRandomAccount();
    spinner.succeed(chalk.green.bold("تم إنشاء البريد والتوكين بنجاح!\n"));

    // 2. عرض تفاصيل البريد في كارت مصمم
    console.log(chalk.gray("--------------------------------------------------"));
    console.log(chalk.bold("📧 البريد المنشأ: ") + chalk.yellow.bold(acc.address));
    console.log(chalk.bold("🔑 كلمة المرور:  ") + chalk.magenta(acc.password));
    console.log(chalk.bold("🛡️ API Token:   ") + chalk.dim(acc.token.substring(0, 25) + "..."));
    console.log(chalk.gray("--------------------------------------------------\n"));

    // 3. المراقبة التلقائية للصندوق بجدول منظم
    const watchSpinner = ora(chalk.cyan("في انتظار وصول رسائل جديدة (تحديث كل 5 ثوانٍ)...")).start();

    setInterval(async () => {
      try {
        const msgs = await mail.getMessages();
        watchSpinner.text = chalk.cyan(`في انتظار الوصول... (إجمالي الرسائل: ${msgs.length})`);

        if (msgs.length > 0) {
          watchSpinner.stop();
          console.log("\n" + chalk.green.bold("📬 الرسائل المستلمة حديثاً:"));

          const table = new Table({
            head: [chalk.cyan('ID'), chalk.cyan('المرسل'), chalk.cyan('الموضوع'), chalk.cyan('الوقت')],
            colWidths: [12, 25, 30, 15]
          });

          msgs.forEach(m => {
            table.push([
              m.id.substring(0, 8),
              m.from.address.substring(0, 22),
              m.subject ? m.subject.substring(0, 26) : "بدون موضوع",
              new Date(m.createdAt).toLocaleTimeString()
            ]);
          });

          console.log(table.toString());
          watchSpinner.start();
        }
      } catch (err) {
        // تجاهل أخطاء التحديث المؤقتة
      }
    }, 5000);

  } catch (err) {
    spinner.fail(chalk.red("حدث خطأ أثناء الاتصال بالخادم: " + err.message));
  }
}

main();
