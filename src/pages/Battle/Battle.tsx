import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import styles from "./Battle.module.css";
import PopupWithRedirect from "../../components/PopupWithRedirect/PopupWithRedirect.tsx";
import getSpells from "../../services/spells.tsx";
import { getWizzardById } from "../../services/wizzards.tsx";
import BattleCard from "../../components/BattleCard/BattleCard.tsx";
import useLocalStorage from "../../hooks/useLocalStorage.tsx";
import { SpellObject } from "../../types/types.ts";

const initialOpponentTurn: string = Math.floor(Math.random() * 2)
  ? "first"
  : "second";

const Battle: React.FC = () => {
  const [firstOpponent, setFirstOpponent] = useLocalStorage(
    "firstOpponent",
    null,
  );
  const [secondOpponent, setSecondOpponent] = useLocalStorage(
    "secondOpponent",
    null,
  );
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);

  const [spells, setSpells] = useState<SpellObject[]>([]);
  const [isOpponentMove, setisOpponentMove] = useState<string>(initialOpponentTurn);
  const [winnerName, setWinnerName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getSpells().then((res) => {
      let arrLength: number = res.length;
      if (arrLength > 20) {
        arrLength = 20;
      }
      setSpells(res.slice(0, arrLength));
    });
    getWizzardById(firstOpponent.id).then((res) => setFirstOpponent(res));
    getWizzardById(secondOpponent.id).then((res) => setSecondOpponent(res));
  }, []);

  function getFirstOpponentSpell(spell: SpellObject) {
    const health: number = secondOpponent.healthPoints;
    const spellDamage: number = spell.damage;
    const mana: number = firstOpponent.manaPoints;
    const usedMana: number = spell.mana;
    secondOpponent.healthPoints = health - spellDamage;
    firstOpponent.manaPoints = mana - usedMana;
    setisOpponentMove("second");
    if (secondOpponent.healthPoints < 0) {
      secondOpponent.healthPoints = 0;
    }
    if (firstOpponent.manaPoints < 0) {
      firstOpponent.manaPoints = 0;
    }
  }

  function getSecondOpponentSpell(spell: SpellObject) {
    const health: number = firstOpponent.healthPoints;
    const spellDamage: number = spell.damage;
    const mana: number = secondOpponent.manaPoints;
    const usedMana: number = spell.mana;
    firstOpponent.healthPoints = health - spellDamage;
    secondOpponent.manaPoints = mana - usedMana;
    setisOpponentMove("first");
    if (firstOpponent.healthPoints < 0) {
      firstOpponent.healthPoints = 0;
    }
    if (secondOpponent.manaPoints < 0) {
      secondOpponent.manaPoints = 0;
    }
  }

  function checkWinner() {
    if (
      secondOpponent.healthPoints <= 0
      || firstOpponent.healthPoints <= 0
      || secondOpponent.manaPoints <= 0
      || firstOpponent.manaPoints <= 0
    ) {
      if (secondOpponent.healthPoints <= 0 || secondOpponent.manaPoints <= 0) {
        setWinnerName(`${firstOpponent.firstName} ${firstOpponent.lastName}`);
      } else {
        setWinnerName(`${secondOpponent.firstName} ${secondOpponent.lastName}`);
      }
      setIsOpenPopup(true);
    }
  }

  useEffect(() => {
    checkWinner();
  }, [
    firstOpponent.healthPoints,
    secondOpponent.healthPoints,
    firstOpponent.manaPoints,
    secondOpponent.manaPoints,
  ]);

  const closePopup = () => setIsOpenPopup(false);
  const redirectAfterWin = () => {
    navigate("/feedback");
    setFirstOpponent(null);
    setSecondOpponent(null);
    localStorage.removeItem("isBattleStarted");
  };
  return (
    <>
      <section className={styles.battle}>
        <div className={styles.battle__textBox}>
          <h1
            className={classNames(styles.battle__text, {
              [styles.disable]: isOpponentMove === "first",
            })}
          >
            Your turn
          </h1>
          <h1
            className={classNames(styles.battle__text, {
              [styles.disable]: isOpponentMove === "second",
            })}
          >
            Your turn
          </h1>
        </div>
        <div className={styles.battle__containers}>
          <BattleCard
            opponentData={firstOpponent}
            spells={spells}
            useSpell={getFirstOpponentSpell}
            isOpponentTurn={isOpponentMove === "second"}
          />
          <BattleCard
            opponentData={secondOpponent}
            spells={spells}
            useSpell={getSecondOpponentSpell}
            isOpponentTurn={isOpponentMove === "first"}
          />
        </div>
      </section>
      {isOpenPopup && (
        <PopupWithRedirect
          onClose={closePopup}
          onRedirect={redirectAfterWin}
          message={`Congratulations, ${winnerName}, you win! We redirect you to another page to fill out the feedback form.`}
        />
      )}
    </>
  );
};

export default Battle;
