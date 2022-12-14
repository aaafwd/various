(function() {

function sleep(duration){
    var now = new Date().getTime();
    while(new Date().getTime() < now + duration) {}
}

Array.from(document.querySelector("#coupon-center").shadowRoot.querySelectorAll("pbc-coupon"))
  .map(node => node.shadowRoot.querySelector("pbc-coupon-call-to-action"))
  .map(node => node.shadowRoot.querySelector(".coupon-call-to-action__button.coupon__activate-button.not-activated"))
  .filter(node => node)
  .forEach(node => {
    console.log("Clicking: " + node);
    sleep(100);
    node.click();
  });
  
})();
