const { YoutubeTranscript } = require('youtube-transcript');

module.exports = async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    res.status(400).json([]);
    return;
  }
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    const out = items.map(i => {
      // algumas versões devolvem em milissegundos, outras em segundos
      const big = i.offset > 100000 || i.duration > 1000;
      return {
        start: big ? i.offset / 1000 : i.offset,
        dur: big ? i.duration / 1000 : i.duration,
        text: String(i.text).replace(/&amp;#39;/g, "'").replace(/&amp;amp;/g, '&').replace(/\n/g, ' ')
      };
    });
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json([]);
  }
};
