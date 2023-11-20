A script that automatically checks the daily price of a game for sales/discounts and notify via Discord or Telegram.

## Setup
1. Go to [Google Apps Script](https://script.google.com/home/start) and create a new project.
2. Select the editor and paste the code in. Update the config values for Discord/Telegram accordingly.
3. In the editor, select "main" and click the "Run" button at the top. Allow the necessary permissions.
4. Create a new trigger. Choose "main" as the function to run, set the event source to "Time-driven," choose "Day timer" as the trigger type, and select a time.

References:
- [Discord ID](https://support.discord.com/hc/en-us/articles/206346498)
- [Discord Webhook](https://support.discord.com/hc/en-us/articles/228383668)
- Get Telegram ID from [@IDBot](https://t.me/myidbot)
- [Telegram BotFather](https://core.telegram.org/bots/features#botfather)
- Get Telegram Bot token from [@BotFather](https://t.me/botfather)