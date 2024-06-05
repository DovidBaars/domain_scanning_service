-- @block Bookmarked query
-- @group Ungrouped
-- @name Get Results by URL

SELECT * FROM Results
WHERE domainId = (
    SELECT id FROM Domain
    WHERE url = 'https://www.schcccxxccs.com'
)