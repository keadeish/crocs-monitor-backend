const puppeteer = require("puppeteer-extra");
const antibotbrowser = require("antibotbrowser"); //cloufdlare bypass
const dotenv = require("dotenv");
dotenv.config();
const DISCORD_ID = process.env.DISCORD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
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

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
interface ICrocs {
  itemName: string;
  image: string;
  link: string;
}
//
import express from "express";
const app = express();
const port = 3000;
let status = "";
let itemFound = [];

app.get("/:keyword/:item?", async (req, res) => {
  const { keyword, item } = req.params;
  let url = `https://www.crocs.co.uk/on/demandware.store/Sites-crocs_gb-Site/en_GB/Search-Show?q=${keyword}`;
  async function main(url: string) {
    let containsItem = false;
    const antibrowser = await antibotbrowser.startbrowser();
    const browser = await puppeteer.connect({
      browserWSEndpoint: antibrowser.websokcet,
    });
    const page = await browser.newPage();
    await page.goto(url);
    //add option for when one option is find (there's only one item & it brings you to the product page)
    try {
      await page.waitForSelector(".js-cx-productcard-list.ok-card-list", {
        timeout: 5000,
      });
      console.log("Selector found!");
    } catch (error) {
      res.send(`Error: Keyword '${keyword}' is incorrect`);
    }
    const crocsData: ICrocs = await page.evaluate(() => {
      const pageText = document.querySelector(
        ".js-cx-productcard-list.ok-card-list",
      );
      const items = pageText ? Array.from(pageText.querySelectorAll("li")) : [];
      const data = items.map((e) => {
        let itemName = e.querySelector(".ok-card")?.getAttribute("aria-label");
        let image = e
          .querySelector(".ok-card__image-wrap")
          ?.querySelector("img")?.src;
        let link = e.querySelector(".ok-card__link")?.getAttribute("href");
        return { itemName, image, link };
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
      if (
        (newName.includes(newItemWanted) || newName == newItemWanted) &&
        containsItem == false
      ) {
        console.log(newItemWanted, newName);
        containsItem = true;
        let itemIndex = Number(i);
        console.log(`found item ${crocsData[i].itemName}`);
        let crocsImage = crocsData[i].image;
        let crocsLink = crocsData[i].link;
        let crocsName = crocsData[itemIndex].itemName;
        const embed = new EmbedBuilder()
          .setTitle(`**${crocsName}**`)
          .setImage(`${crocsImage}`)
          .setDescription(`**Purchase Link:** ${crocsLink}`)
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
      }
    }
    if (containsItem == false) {
      console.log(`${itemWanted} Crocs not found!`);
      status = "Crocs not found!";
      await browser.close();
      await delay(10000); //10 second delay
      await main(url);
      return status;
    }
  }
  await main(url);
  res.send(`${status} ${itemFound} ${keyword}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
