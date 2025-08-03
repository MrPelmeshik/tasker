using System.Collections;
using Migrator;

namespace Tests;

public class Extends_MigrationRegex_Tests
{
    [Test, TestCaseSource(typeof(TestCases), nameof(TestCases.GetTestCases))]
    public void Test(
        string text,
        MyMatch expectedMyMatch)
    {
        var actualMatch = Extends.MigrationRegex.Match(text);
        
        Assert.That(expectedMyMatch.Success,
            Is.EqualTo(actualMatch.Success));
        Assert.That(expectedMyMatch.MatchOrder,
            Is.EqualTo(actualMatch.Groups["order"].Value));
        Assert.That(expectedMyMatch.MatchDesc,
            Is.EqualTo(actualMatch.Groups["desc"].Value));
    }

    private class TestCases
    {
        public static IEnumerable GetTestCases
        {
            get
            {
                yield return new TestCaseData(
                        "file",
                        new MyMatch(
                            false,
                            String.Empty, 
                            String.Empty))
                    .SetName("Несовпадение по regex");
                yield return new TestCaseData(
                        "0001.test.sql",
                        new MyMatch(
                            true,
                            "0001",
                            "test"))
                    .SetName("Полное совпадение");
            }
        }
    }

    public class MyMatch(bool success, string? matchOrder, string? matchDesc)
    {
        public bool Success { get; init; } = success;
        public string? MatchOrder { get; init; } = matchOrder;
        public string? MatchDesc { get; init; } = matchDesc;
    }
}