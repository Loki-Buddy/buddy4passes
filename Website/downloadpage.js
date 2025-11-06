function downloadFiles() {
    // Link zum Bucket
    const url= "http://website-b4p.s3-website.eu-central-1.amazonaws.com/mellon.zip";
    const link = document.creatElement("a");
    link.href = url;

    link.download="mellon.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Meldung
    alert("Download wurde gestartet!");
}