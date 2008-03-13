<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.w3.org/2003/05/soap-envelope"
  xmlns:x="urn:flickr"
  exclude-result-prefixes="s x">
  <xsl:template match="/">
    <html>
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
      <meta content="text/javascript" http-equiv="Content-Script-Type" />
      <meta content="text/css" http-equiv="Content-Style-Type" />
      <head>
        <title>flickr.photos.getRecent</title>
      </head>
      <body>
        <ul>
          <xsl:apply-templates select="//photos/photo" />
        </ul>
      </body>
    </html>
  </xsl:template>
  <xsl:template match="//photos/photo">
    <xsl:variable name="img" select="concat('http://farm',@farm,'.static.flickr.com/',@server,'/',@id,'_',@secret,'_t.jpg')" />
    <li id="img-{@id}">
      <img src="{$img}" title="{@title}" />
      <xsl:value-of select="@title" />
    </li>
  </xsl:template>
</xsl:stylesheet>