import pytest

from app.district_utils import canonical_state, clean_name, pick_columns


def test_canonical_state_handles_official_spellings():
    assert canonical_state("ANDHRA PRADESH") == "Andhra Pradesh"
    assert canonical_state("NCT of Delhi") == "Delhi"
    assert canonical_state("Jammu & Kashmir") == "Jammu and Kashmir"
    assert canonical_state("The Dadra And Nagar Haveli And Daman And Diu") == "Dadra and Nagar Haveli and Daman and Diu"
    assert canonical_state("Orissa") == "Odisha"
    assert canonical_state("Atlantis") is None


def test_clean_name():
    assert clean_name("KANPUR  NAGAR") == "Kanpur Nagar"
    assert clean_name("Y.S.R. Kadapa") == "Y.S.R. Kadapa"


def test_pick_columns():
    lgd = ["S. No.", "State Code", "State Name(In English)", "District Code", "District Name(In English)", "Census 2011 Code"]
    assert pick_columns(lgd) == ("State Name(In English)", "District Name(In English)")
    assert pick_columns(["state", "district"]) == ("state", "district")
    with pytest.raises(SystemExit):
        pick_columns(["foo", "bar"])
