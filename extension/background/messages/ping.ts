import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const endpoint = process.env.PLASMO_PUBLIC_ENDPOINT

  const data = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      youtube_id: req.body.youtube_id,
      query: req.body.query,
      chat: req.body.chat
    })
  }).then((response) => response.json())

  res.send(data)
}

export default handler
