module.exports = async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) { res.status(400).json([]); return; }
  try {
    const r = await fetch(
      'https://api.supadata.ai/v1/youtube/transcript?videoId=' +
        encodeURIComponent(videoId) + '&lang=en&text=false',
      { headers: { 'x-api-key': process.env.SUPADATA_KEY } }
    );
    const data = await r.json();
    if (!Array.isArray(data.content) || (data.lang && data.lang !== 'en')) {
      res.status(200).json([]);
      return;
    }
    const out = data.content.map(i => ({
      start: i.offset / 1000,
      dur: i.duration / 1000,
      text: String(i.text).replace(/\n/g, ' ')
    }));
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json([]);
  }
};
