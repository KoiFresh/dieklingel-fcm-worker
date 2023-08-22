function base64ToUint8Array(str: string): Uint8Array {
	let k = str.slice(str.indexOf(',') + 1).trim();
	var binaryImg = atob(k);
	var length = binaryImg.length;
	var ab = new ArrayBuffer(length);
	var ua = new Uint8Array(ab);
	for (var i = 0; i < length; i++) {
		ua[i] = binaryImg.charCodeAt(i);
	}
	return ua;
}

export {
	base64ToUint8Array
}