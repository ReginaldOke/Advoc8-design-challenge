/* Suggested search phrase per topic, shared by the search page and the feed builder. */
(function () {
  var TRY = { 'Economics': 'interest rates', 'Taxation': 'capital gains tax', 'Finance': 'superannuation', 'Corporate Affairs': 'small business', 'Industry, Science and Innovation': 'critical minerals', 'Technology': 'data breach', 'Consumer Affairs': 'scams', 'Food and Beverage': 'grocery prices', 'Tourism and Hospitality': 'cruise ships', 'Government Grants': 'grant funding', 'Transport': 'road safety', 'Workplace Relations': 'enterprise bargaining', 'Agriculture': 'drought', 'Energy and Mining': 'gas prices', 'Environment': 'solar panels', 'Planning and Development': 'housing approvals', 'Arts and Culture': 'arts funding', 'Education': 'teacher shortage', 'Health': 'bulk billing', 'Indigenous Affairs': 'closing the gap', 'Social Services': 'childcare subsidy', 'Sport and Recreation': 'stadium funding', 'Defence': 'AUKUS', 'Emergency Management': 'bushfire', 'Foreign Affairs and Trade': 'free trade', 'Home Affairs': 'migration', 'Legal Affairs': 'privacy reform', 'Media and Communications': 'mobile coverage' };
  function topicHint() {
    var topic = (location.search.match(/[?&]topic=([^&#]*)/) || [])[1];
    topic = topic ? decodeURIComponent(topic.replace(/\+/g, ' ')) : null;
    if (!topic) { try { topic = (JSON.parse(localStorage.getItem('advoc8-onboard') || 'null') || {}).topic; } catch (e) {} }
    return topic || null;
  }
  window.l2TopicHint = topicHint;
  window.l2TryPhrase = function (topic) { return 'Try "' + (TRY[topic || topicHint()] || 'solar panels') + '"'; };
})();
