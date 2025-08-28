(function(){chrome.runtime.onMessage.addListener(function(n,e,o){return n.action&&(console.log("Action received: "+n.action),window.location.href=n.action,o({result:n.action+" completed"})),!0});
})()
