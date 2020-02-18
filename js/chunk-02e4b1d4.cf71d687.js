(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-02e4b1d4"],{1309:function(e,t,r){"use strict";r.r(t);var n=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("Dialog",{attrs:{title:"Offer details"},on:{cancel:function(t){return e.$emit("cancel")}}},[r("div",[r("b",[e._v("Price:")]),e._v(" "+e._s(e.priceInEth)+" ETH")]),r("div",[r("b",[e._v("Buyer:")]),e._v(" "+e._s(e.offer.buyer))]),r("div",[r("b",[e._v("Offered Cryptomons:")]),e._v(" "),0===e.offer.offeredCryptomons.length?r("i",[e._v("None")]):e._e()]),e.isReady?r("CryptomonList",{attrs:{simple:!0,cryptomons:e.offeredCryptomonsAsList}}):e._e(),r("div",{staticClass:"button-group"},[e.isSeller?r("button",{on:{click:function(t){return e.acceptOffer()}}},[e._v("Accept")]):e._e(),e.isSeller?r("button",{staticClass:"bg-red",on:{click:function(t){return e.rejectOffer()}}},[e._v("Reject")]):e._e(),e.isBuyer?r("button",{staticClass:"bg-red",on:{click:function(t){return e.withdrawOffer()}}},[e._v("Withdraw")]):e._e()])],1)},o=[];r("a623"),r("d81d"),r("d3b7"),r("ddb0");function i(e){if(Array.isArray(e))return e}r("a4d3"),r("e01a"),r("d28b"),r("e260"),r("25f0"),r("3ca3");function a(e,t){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)){var r=[],n=!0,o=!1,i=void 0;try{for(var a,c=e[Symbol.iterator]();!(n=(a=c.next()).done);n=!0)if(r.push(a.value),t&&r.length===t)break}catch(s){o=!0,i=s}finally{try{n||null==c["return"]||c["return"]()}finally{if(o)throw i}}return r}}function c(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function s(e,t){return i(e)||a(e,t)||c()}r("96cf");var u=r("1da1"),f=r("d4ec"),p=r("bee2"),l=r("99de"),y=r("7e84"),d=r("262e"),h=r("9ab4"),v=r("2fe1"),b=r("60a3"),m=r("2ef0"),w=r.n(m),g=r("7248"),O=r("2ada"),k=r("444a"),j=r("fc60"),_=r("244e"),C=function(e){function t(){return Object(f["a"])(this,t),Object(l["a"])(this,Object(y["a"])(t).apply(this,arguments))}return Object(d["a"])(t,e),Object(p["a"])(t,[{key:"created",value:function(){this.isReady||this.loadMissingCryptomons()}},{key:"loadMissingCryptomons",value:function(){var e=Object(u["a"])(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t=w()(this.offeredCryptomons).pickBy((function(e){return!e})).keys().map(w.a.toNumber).value(),e.next=3,this.$store.dispatch(j["a"].FetchCryptomonsByIds,t);case 3:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"acceptOffer",value:function(){var e=Object(u["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,this.$store.dispatch(j["a"].AcceptOffer,this.offer.cryptomonId);case 2:this.$emit("offer-accepted");case 3:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"rejectOffer",value:function(){var e=Object(u["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,this.$store.dispatch(j["a"].RejectOffer,this.offer.cryptomonId);case 2:this.$emit("offer-rejected");case 3:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"withdrawOffer",value:function(){var e=Object(u["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,this.$store.dispatch(j["a"].WithdrawOffer,this.offer.cryptomonId);case 2:this.$emit("offer-withdrawn");case 3:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"isReady",get:function(){return w.a.every(w.a.values(this.offeredCryptomons))}},{key:"offeredCryptomons",get:function(){var e=this.$store.getters[k["a"].GetCryptomonById];return w()(this.offer.offeredCryptomons).map((function(t){return[t,e(w.a.toNumber(t))]})).keyBy((function(e){var t=s(e,2),r=t[0];t[1];return r})).mapValues((function(e){var t=s(e,2),r=(t[0],t[1]);return r})).value()}},{key:"offeredCryptomonsAsList",get:function(){return w.a.values(this.offeredCryptomons)}},{key:"priceInEth",get:function(){return this.$store.state.web3.utils.fromWei(this.offer.price,"ether")}},{key:"isSeller",get:function(){return this.owner===this.$store.getters[k["a"].DefaultAccount]}},{key:"isBuyer",get:function(){return this.offer.buyer===this.$store.getters[k["a"].DefaultAccount]}}]),t}(b["c"]);Object(h["a"])([Object(b["b"])(O["d"])],C.prototype,"offer",void 0),Object(h["a"])([Object(b["b"])(String)],C.prototype,"owner",void 0),C=Object(h["a"])([Object(v["b"])({components:{CryptomonList:_["a"],Dialog:g["a"]}})],C);var R=C,$=R,x=r("2877"),A=Object(x["a"])($,n,o,!1,null,null,null);t["default"]=A.exports},a623:function(e,t,r){"use strict";var n=r("23e7"),o=r("b727").every,i=r("a640"),a=r("ae40"),c=i("every"),s=a("every");n({target:"Array",proto:!0,forced:!c||!s},{every:function(e){return o(this,e,arguments.length>1?arguments[1]:void 0)}})}}]);
//# sourceMappingURL=chunk-02e4b1d4.cf71d687.js.map