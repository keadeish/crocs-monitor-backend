const puppeteer = require("puppeteer-extra");
const antibotbrowser = require("antibotbrowser"); //cloufdlare bypass
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const DISCORD_ID = process.env.DISCORD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
import { ICrocs } from "./Utils/Interfaces";
import { delay } from "./Utils/functions";
const { EmbedBuilder, WebhookClient } = require("discord.js");
let webhookClient = new WebhookClient({
  id: DISCORD_ID,
  token: DISCORD_TOKEN,
});
if (!DISCORD_ID || !DISCORD_TOKEN) {
  throw new Error(
    "DISCORD_ID or DISCORD_TOKEN is not defined in environment variables",
  );
}
import express from "express";
// const fs = require('fs');
const htmlContent = fs.readFileSync('index.html', 'utf-8');
const app = express();
const port = 3000;
let itemFound = [];

app.get("/", async (req, res) => {
  // res.send("Crocs Monitor :)");
  res.send(htmlContent)
})

app.get("/favicon.ico", async (req, res) => {
  res.status(204).send();
})

app.get("/:keyword/:item?", async (req, res) => {
  const { keyword, item } = req.params;
  let url = `https://www.crocs.co.uk/on/demandware.store/Sites-crocs_gb-Site/en_GB/Search-Show?q=${keyword}`;

  async function main(url: string) {
    let containsItem = false;
    const antibrowser = await antibotbrowser.startbrowser(9222);  
    const browser = await puppeteer.connect({
      browserWSEndpoint: antibrowser.websokcet,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" }); // goes to URL & waits for page to fully load
    //loaded page!
    let currentURL: string = page.url();
    if (currentURL.includes("#search") === false) {
      await page.waitForSelector(
        ".product-name.cx-heading.text-bold.text-uppercase.mb-0.smaller.mt-10",
      );
    //Retrieved instant checkout page"
      await browser.close();
      return res.send(currentURL);
    }
    //add option for when one option is find (there's only one item & it brings you to the product page)
    try {
      await page.waitForSelector(".js-cx-productcard-list.ok-card-list", {
        timeout: 5000,
      });
    //Selector found!
    } catch (error) {
      res.send(`Error: Keyword '${keyword}' is incorrect`);
    }
    const crocsData: ICrocs = await page.evaluate(() => {
      const pageText = document.querySelector(
        ".js-cx-productcard-list.ok-card-list",
      );
      const items = pageText ? Array.from(pageText.querySelectorAll("li")) : [];
      console.log(items)
      const data = items.map((e) => {
        const itemName = e.querySelector(".ok-card__product-name")?.textContent?.trim() || "No Name"
        let image = e
          .querySelector(".ok-card__image-wrap")
          ?.querySelector("img")?.src;
        let link = e.querySelector(".ok-card__link")?.getAttribute("href");
        const status = e.querySelector(".ok-card__snipe span")?.textContent?.trim() || "no status"; // Extract "Coming Soon" text
        return { itemName, image, link, status };
      });
      return data;
    });

    let itemWanted = keyword;

    if (item) {
      itemWanted = item;
      console.log(`Item looking for: ${item}`);
    }
    for (let i in crocsData) {
      let name: string = crocsData[i].itemName;
      let newName = name.toLocaleLowerCase();
      let newItemWanted = itemWanted.toLocaleLowerCase();
      let status = crocsData[i].status
      if (
        (newName.includes(newItemWanted) || newName == newItemWanted) &&
        containsItem == false && status!== 'Coming Soon On The App'
      ) {
        console.log(newItemWanted, newName, status);
        containsItem = true;
        let itemIndex = Number(i);
        console.log(`found item ${crocsData[i].itemName}`);
        let crocsImage = crocsData[i].image;
        let crocsLink = crocsData[i].link;
        let crocsName = crocsData[itemIndex].itemName;
        const embed = new EmbedBuilder()
          .setTitle(`**${crocsName}**`)
          .setImage(`${crocsImage}`)
          .setDescription(`**Checkout Link:** ${crocsLink}`)
          .setColor(0x00ffff);
        webhookClient.send({
          content: ``,
          username: "Crocs Bot",
          avatarURL:
            "https://logolook.net/wp-content/uploads/2023/03/Crocs-Symbol.png",
          embeds: [embed],
        });
        await browser.close();
        itemFound = [crocsName, crocsLink];
        res.send(`Found: ${itemFound[0]} \n Checkout Link: ${itemFound[1]}`);
      }
    }
    if (containsItem == false) {
      console.log(`${itemWanted} Crocs not found!`);
      let status = "Crocs not found!";
      await browser.close();
      await delay(17000); //30 second delay
      await main(url);
      return status;
    }
  }
  await main(url);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});