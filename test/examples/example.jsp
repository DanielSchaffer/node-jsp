<%@ include file="./header.jsp"%>

<%-- comment! --%>

<c:set var="foo" value="wat" />

<c:set var="testSetContent">
    <div id="test-set-content"></div>
</c:set>

<c:if test="${foo}">
    <div id="if-content"></div>
</c:if>

<c:if test="${doesNotExist}">
    <div id="will-not-be-there"></div>
</c:if>

<%-- another comment! --%>

<c:choose>
    <c:when test="${foo}"><div id="when-content"></div></c:when>
    <c:when test="${doesNotExist}"><div id="when-no-match"></div></c:when>
</c:choose>

<c:choose>
    <c:when test="${doesNotExist}"><div id="when-no-match-otherwise"></div></c:when>
    <c:otherwise><div id="otherwise-content"></div></c:otherwise>
</c:choose>

<jsp:include page="include.jsp" />

<div id="on-example">testContent</div>

<div id="binding">bound value 1: ${foo} bound value 2: ${oy}</div>

<div id="attr-binding" class="${foo}"></div>

<div id="binding-with-sqliteral">${foo ? 'sqliteral!' : 'still-a-literal'}</div>
<div id="binding-with-dqliteral">${foo ? "dqliteral!" : "still-a-literal"}</div>

<%-- yet another comment! --%>

<mesmo:example><div id="custom-tag-passthrough"></div></mesmo:example>

<div id="nested-setting">
    <c:set var="top">
        <div id="nested-setting-top">
            <c:set var="nested">
                <div id="nested-set-content">foo</div>
            </c:set>
            <span>nested:${nested}</span>
        </div>
    </c:set>
    <span>top:${top}</span>
</div>