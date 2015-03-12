<%@ include file="./header.jsp"%>

<c:set var="foo" value="wat" />

<c:if test="${foo}">
    <div id="if-content"></div>
</c:if>

<c:if test="${doesNotExist}">
    <div id="will-not-be-there"></div>
</c:if>

<jsp:include page="include.jsp" />

<div id="on-example">testContent</div>

<div id="binding">bound value 1: ${foo} bound value 2: ${oy}</div>
