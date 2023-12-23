import { getEmoji } from "@/constants";
import { EmbedBuilder } from "discord.js";
import i18next from "i18next";

// WIP
export default function (lang: string): EmbedBuilder {
  i18next.changeLanguage(lang);

  return new EmbedBuilder()
    .addFields(
      {
        name: getEmoji("red_bug") + i18next.t("errors:item.stocksError.title"),
        value: getEmoji("red_line"),
      },
      {
        name: " ",
        value:
          i18next.t("errors:item.stocksError.description") +
          "\n\n" +
          i18next.t("errors:default.serverReport"),
      }
    )
    .setColor("#dd4040")
    .setTimestamp();
}
